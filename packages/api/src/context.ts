import type { YogaInitialContext } from '@graphql-yoga/node';
import {
  CredentialType,
  type Event,
  type EventManager,
  type Group,
  type GroupMember,
  type Major,
  type School,
  type User,
} from '@prisma/client';
import { GraphQLError } from 'graphql';
import { prisma } from './prisma.js';
import { fullName } from './objects/users.js';

const getToken = ({ headers }: Request) => {
  const auth = headers.get('Authorization');
  if (!auth) return;
  return auth.slice('Bearer '.length);
};

/** In memory store for sessions. */
const sessions = new Map<
  string,
  User & { fullName: string } & {
    groups: Array<GroupMember & { group: Group }>;
    major: Major & { schools: School[] };
    managedEvents: Array<EventManager & { event: Event & { group: Group } }>;
  }
>();

/** Deletes the session cache for a given user id. */
export const purgeUserSessions = (uid: User['uid']) => {
  for (const [token, user] of sessions) if (user.uid === uid) sessions.delete(token);
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
            contributesTo: {
              include: {
                school: true,
              },
            },
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
  user.canEditGroups ||= user.admin;
  user.canEditUsers ||= user.admin;

  // When the in memory store grows too big, delete some sessions
  if (sessions.size > 10_000)
    for (const [i, token] of [...sessions.keys()].entries()) if (i % 2) sessions.delete(token);

  sessions.set(token, { ...user, fullName: fullName(user) });

  return {
    ...user,
    fullName: fullName(user),
  };
};

export type Context = YogaInitialContext & Awaited<ReturnType<typeof context>>;

/** The request context, made available in all resolvers. */
export const context = async ({ request }: YogaInitialContext) => {
  const token = getToken(request);
  if (!token) return {};
  return { token, user: await getUser(token) };
};
