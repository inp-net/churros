import { cacheSession, getCachedSession, log } from '#lib';
import { fullName } from '#modules/users';
import { onBoard } from '#permissions';
import {
  CredentialType,
  ThirdPartyCredentialType,
  type Group,
  type StudentAssociation,
} from '@churros/db/prisma';
import type { YogaInitialContext } from '@graphql-yoga/node';
import { verify } from 'argon2';
import { GraphQLError } from 'graphql';
import { isThirdPartyToken } from './auth.js';
import { yearTier } from './date.js';
import { ensureGlobalId } from './global-id.js';
import { prisma } from './prisma.js';

const getToken = (headers: Headers) => {
  const auth = headers.get('Authorization');
  if (!auth) return;
  // Some clients can fuck shit up and have "Bearer bearer thetoken" as the Authorization value…
  return auth.split(/bearer /i).at(-1);
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
            major: { include: { schools: { include: { studentAssociations: true } } } },
            adminOfStudentAssociations: true,
            canEditGroups: true,
          },
        },
      },
    })
    .catch(async () => {
      await log('oauth', 'user-from-token/error', { why: 'invalid token', token });
      throw new GraphQLError('Invalid third-party token.');
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
  const cached = await getCachedSession(token);
  if (cached) return cached;
  console.info(`Session cache miss for token ${token}`);

  const credential = await prisma.credential
    .findFirstOrThrow({
      where: { type: CredentialType.Token, value: token },
      include: {
        user: {
          include: {
            groups: { include: { group: true } },
            managedEvents: { include: { event: { include: { group: true } } } },
            major: { include: { schools: { include: { studentAssociations: true } } } },
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

  const session = {
    ...user,
    fullName: fullName(user),
    yearTier: yearTier(user.graduationYear),
  };

  await cacheSession(token, session);
  return session;
};

export type Context = YogaInitialContext & Awaited<ReturnType<typeof context>>;

function emptyContext() {
  return { caveats: [] as string[], user: undefined, token: undefined };
}

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
      ...emptyContext(),
      token: `churros_clientcredentials_${encodedValue}`,
      client,
    };
  }

  const token = getToken(headers);
  if (!token) return emptyContext();

  try {
    const user = await (isThirdPartyToken(token) ? getUserFromThirdPartyToken : getUser)(token);
    return { ...emptyContext(), token, user };
  } catch (error) {
    console.error(
      `Could not get user from token ${JSON.stringify(token)}: ${error?.toString() ?? 'undefined'}`,
    );
    return emptyContext();
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
