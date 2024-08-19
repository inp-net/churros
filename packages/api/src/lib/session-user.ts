import { prisma, redisClient, yearTier } from '#lib';
import { fullName } from '#modules/users/utils';
import { onBoard } from '#permissions';
import type { Credential, Group, Prisma, StudentAssociation, User } from '@churros/db/prisma';

export const SessionUserPrismaIncludes = {
  groups: { include: { group: true } },
  managedEvents: { include: { event: { include: { group: true } } } },
  major: { include: { schools: true } },
  adminOfStudentAssociations: true,
  canEditGroups: true,
} as const satisfies Prisma.UserInclude;

export interface SessionUser
  extends Prisma.UserGetPayload<{ include: typeof SessionUserPrismaIncludes }> {
  fullName: string;
  yearTier: number;
  credential?: Credential['value'];
}

export function sessionUserCacheKey(uid: User['uid']): string {
  return `userSession:${uid}`;
}

async function cacheSessionUser(uid: User['uid'], session: SessionUser) {
  return redisClient()
    .call('JSON.SET', sessionUserCacheKey(uid), '.', JSON.stringify(session))
    .catch((error) => {
      console.error(`Failed to cache session for ${uid}: ${error?.toString()}`);
    });
}

async function getCachedSessionUser(uid: User['uid']): Promise<SessionUser | null> {
  return redisClient()
    .call('JSON.GET', sessionUserCacheKey(uid), '$')
    .then((json) => (json && typeof json === 'string' ? JSON.parse(json).at(0) : null))
    .catch((error) => {
      console.error(`Failed to get cached user session for ${uid}: ${error?.toString()}`);
      return null;
    });
}

async function getSessionUserFromDatabase(uid: User['uid']): Promise<SessionUser> {
  // Fetch the user from the database
  const user = await prisma.user
    .findUnique({
      where: { uid },
      include: SessionUserPrismaIncludes,
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
 * @param credential
 */
export async function getSessionUser(uid: User['uid'], credential?: string): Promise<SessionUser> {
  const cached = await getCachedSessionUser(uid);
  if (cached) return cached;

  const session = await getSessionUserFromDatabase(uid);
  await cacheSessionUser(uid, session);
  return {
    ...session,
    credential,
  };
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

export async function purgeSessionsUser(uid: User['uid']) {
  return redisClient()
    .del(sessionUserCacheKey(uid))
    .catch((error) => {
      console.error(`Failed to purge user session for ${uid}: ${error?.toString()}`);
    });
}
