import { ensureGlobalId, prisma } from '#lib';
import { fullName } from '#modules/users';
import { onBoard } from '#permissions';
import {
  CredentialType,
  ThirdPartyCredentialType,
  type Event,
  type EventManager,
  type Group,
  type GroupMember,
  type Major,
  type School,
  type StudentAssociation,
  type User,
} from '@churros/db/prisma';
import type { YogaInitialContext } from '@graphql-yoga/node';
import { verify } from 'argon2';
import { GraphQLError } from 'graphql';
import { isThirdPartyToken } from './auth.js';
import { yearTier } from './date.js';

const getToken = (headers: Headers) => {
  const auth = headers.get('Authorization');
  if (!auth) return;
  return auth.slice('Bearer '.length);
};

/** In memory store for sessions. */
const sessions = new Map<
  string,
  User & { fullName: string; yearTier: number } & {
    groups: Array<GroupMember & { group: Group }>;
    major: null | (Major & { schools: School[] });
    managedEvents: Array<EventManager & { event: Event & { group: Group } }>;
    adminOfStudentAssociations: StudentAssociation[];
    canEditGroups: StudentAssociation[];
  }
>();

/** Deletes the session cache for a given user id. */
export const purgeUserSessions = (uid: User['uid']) => {
  for (const [token, user] of sessions) if (user.uid === uid) sessions.delete(token);
};

export const getUserFromThirdPartyToken = async (token: string) => {
  const credential = await prisma.thirdPartyCredential
    .findFirstOrThrow({
      where: { value: token, type: ThirdPartyCredentialType.AccessToken },
      include: {
        owner: {
          include: {
            groups: { include: { group: true } },
            managedEvents: { include: { event: { include: { group: true } } } },
            major: { include: { schools: true } },
            adminOfStudentAssociations: true,
            canEditGroups: true,
          },
        },
      },
    })
    .catch(() => {
      throw new GraphQLError('Invalid token.');
    });

  // If the session expired, delete it
  if (credential.expiresAt !== null && credential.expiresAt < new Date()) {
    await prisma.thirdPartyCredential.delete({ where: { id: credential.id } });
    throw new GraphQLError('Session expired.');
  }

  const { owner } = credential;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  normalizePermissions({ user: owner });

  return {
    ...owner,
    fullName: fullName(owner),
    yearTier: yearTier(owner.graduationYear),
  };
};

/** Returns the user associated with `token` or throws. */
const getUser = async (token: string) => {
  if (sessions.has(token)) return sessions.get(token)!;

  const credential = await prisma.credential
    .findFirstOrThrow({
      where: { type: CredentialType.Token, value: token },
      include: {
        // `user` must be at least as populated as what `sessionUserQuery`
        // queries for the cache to work
        user: {
          include: {
            groups: { include: { group: true } },
            managedEvents: { include: { event: { include: { group: true } } } },
            major: { include: { schools: true } },
            adminOfStudentAssociations: true,
            canEditGroups: true,
          },
        },
      },
    })
    .catch(() => {
      throw new GraphQLError('Invalid token.');
    });

  // If the session expired, delete it
  if (credential.expiresAt !== null && credential.expiresAt < new Date()) {
    await prisma.credential.delete({ where: { id: credential.id } });
    throw new GraphQLError('Session expired.');
  }

  // Delete expired sessions once in a while
  if (Math.random() < 0.001) {
    await prisma.credential.deleteMany({
      where: { type: CredentialType.Token, expiresAt: { lt: new Date() } },
    });
  }

  const { user } = credential;

  // Normalize permissions
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  normalizePermissions({ user: user });

  // When the in memory store grows too big, delete some sessions
  if (sessions.size > 10_000)
    for (const [i, token] of [...sessions.keys()].entries()) if (i % 2) sessions.delete(token);

  sessions.set(token, {
    ...user,
    fullName: fullName(user),
    yearTier: yearTier(user.graduationYear),
  });

  return {
    ...user,
    fullName: fullName(user),
    yearTier: yearTier(user.graduationYear),
  };
};

export type Context = YogaInitialContext & Awaited<ReturnType<typeof context>>;

/** The request context, made available in all resolvers. */
export const context = async ({ request, ...rest }: YogaInitialContext) => {
  const headers =
    request && 'headers' in request
      ? request.headers
      : 'connectionParams' in rest
        ? new Headers((rest.connectionParams as { headers: Headers }).headers)
        : new Headers();

  if (headers.get('Authorization')?.startsWith('Basic ')) {
    // base64-decode a string of "client_id:client_secret"
    const encodedValue = headers.get('Authorization')!.slice('Basic '.length);
    const [clientId, clientSecret] = Buffer.from(encodedValue, 'base64')
      .toString('utf8')
      .split(':');

    if (!clientId || !clientSecret) throw new GraphQLError('Invalid client credentials');

    // get the corresponding oauth client
    const client = await prisma.thirdPartyApp.findUnique({
      where: { id: ensureGlobalId(clientId, 'ThirdPartyApp') },
      include: { owner: true },
    });
    if (!client || !(await verify(client.secret, clientSecret)))
      throw new GraphQLError('Invalid client credentials');

    return {
      token: `churros_clientcredentials_${encodedValue}`,
      client,
    };
  }

  const token = getToken(headers);
  if (!token) return {};

  try {
    const user = await (isThirdPartyToken(token) ? getUserFromThirdPartyToken : getUser)(token);
    return { token, user };
  } catch (error) {
    console.error(error);
    return {};
  }
};

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
