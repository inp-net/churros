import { prisma } from '#lib';
import { fullName } from '#modules/users';
import { onBoard } from '#permissions';
import type { YogaInitialContext } from '@graphql-yoga/node';
import {
  CredentialType,
  ThirdPartyCredentialType,
  type Event,
  type EventManager,
  type Group,
  type GroupMember,
  type Major,
  type School,
  type User,
} from '@prisma/client';
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

  normalizePermissions(owner);

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
          },
        },
      },
    })
    .catch(() => {
      console.error(`Invalid token: ${token}`);
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
  normalizePermissions(user);

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

  if (headers.get('Authorization')?.startsWith('Basic ')) return {};

  const token = getToken(headers);
  if (!token) return {};
  // wtf
  if (token === 'undefined') return {};
  console.log(JSON.stringify({ token }));
  return {
    token,
    user: await (isThirdPartyToken(token) ? getUserFromThirdPartyToken : getUser)(token),
  };
};

/**
 * Normalizes the permissions of a user based on its roles.
 * @param user the user to modify in-place
 */
function normalizePermissions(user: {
  groups: {
    president: boolean;
    treasurer: boolean;
    vicePresident: boolean;
    secretary: boolean;
    canEditMembers: boolean;
    canEditArticles: boolean;
    canScanEvents: boolean;
  }[];
  admin: boolean;
  canEditUsers: boolean;
  canEditGroups: boolean;
  canAccessDocuments: boolean;
}): void {
  if (!user) return;
  user.canEditGroups ||= user.admin;
  user.canEditUsers ||= user.admin;
  user.groups = user.groups.map((membership) => ({
    ...membership,
    canEditMembers: membership.canEditMembers || onBoard(membership),
    canEditArticles: membership.canEditArticles || onBoard(membership),
    canScanEvents: membership.canScanEvents || onBoard(membership),
  }));
}
