import { prisma, redisClient, yearTier } from '#lib';
import { onBoard } from '#permissions';
import type { Group, StudentAssociation, User } from '@churros/db/prisma';
import { fullName } from '../modules/users/index.js';

export type UserSession = Express.User;

export function userSessionsKey(uid: User['uid']): string {
  return `userSessions:${uid}`;
}

async function cacheUserSession(uid: User['uid'], session: UserSession) {
  return redisClient()
    .call('JSON.SET', userSessionsKey(uid), '.', JSON.stringify(session))
    .catch((error) => {
      console.error(`Failed to cache session for ${uid}: ${error?.toString()}`);
    });
}

async function getCachedUserSession(uid: User['uid']): Promise<UserSession | null> {
  return redisClient()
    .call('JSON.GET', userSessionsKey(uid), '$')
    .then((json) => (json && typeof json === 'string' ? JSON.parse(json).at(0) : null))
    .catch((error) => {
      console.error(`Failed to get cached user session for ${uid}: ${error?.toString()}`);
      return null;
    });
}

async function getUserSessionFromDatabase(uid: User['uid']): Promise<UserSession> {
  // Fetch the user from the database
  const user = await prisma.user
    .findUnique({
      where: { uid },
      include: {
        groups: { include: { group: true } },
        managedEvents: { include: { event: { include: { group: true } } } },
        major: { include: { schools: true } },
        adminOfStudentAssociations: true,
        canEditGroups: true,
      },
    })
    .catch(() => {
      console.error('An error occurred while fetching user session from the database');
    });

  if (!user) throw new Error(`User not found: ${uid}`);

  // Normalize permissions
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  normalizePermissions({ user: user });

  return {
    ...user,
    fullName: fullName(user),
    yearTier: yearTier(user.graduationYear),
  };
}

/**
 * Get the user session for a given user.
 * @param uid
 */
export async function getUserSession(uid: User['uid']): Promise<UserSession> {
  const cached = await getCachedUserSession(uid);
  if (cached) return cached;

  const session = await getUserSessionFromDatabase(uid);
  await cacheUserSession(uid, session);
  return session;
}

/**
 * Normalizes the permissions of a user based on its roles.
 * @param user the user to modify in-place
 */
function normalizePermissions({
  user,
}: {
  user: {
    groups: (Group & {
      president: boolean;
      treasurer: boolean;
      vicePresident: boolean;
      secretary: boolean;
      canEditMembers: boolean;
      canEditArticles: boolean;
      canScanEvents: boolean;
    })[];
    admin: boolean;
    canAccessDocuments: boolean;
    canEditGroups: StudentAssociation[];
    adminOfStudentAssociations: StudentAssociation[];
  };
}): void {
  if (!user) return;

  const permissionOnStudentAssociation = new Set([
    ...user.canEditGroups.flatMap((studentAssociation) => studentAssociation.id),
    ...user.adminOfStudentAssociations.flatMap((studentAssociation) => studentAssociation.id),
  ]);

  user.groups = user.groups.map((membership) => ({
    ...membership,
    canEditMembers:
      membership.canEditMembers ||
      onBoard(membership) ||
      permissionOnStudentAssociation.has(membership.studentAssociationId ?? ''),
    canEditArticles:
      membership.canEditArticles ||
      onBoard(membership) ||
      permissionOnStudentAssociation.has(membership.studentAssociationId ?? ''),
    canScanEvents:
      membership.canScanEvents ||
      onBoard(membership) ||
      permissionOnStudentAssociation.has(membership.studentAssociationId ?? ''),
  }));
}

export async function purgeUserSessions(uid: User['uid']) {
  return redisClient()
    .del(userSessionsKey(uid))
    .catch((error) => {
      console.error(`Failed to purge user session for ${uid}: ${error?.toString()}`);
    });
}
