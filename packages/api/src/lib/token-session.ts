import { getSessionUser, prisma, redisClient, type SessionUser } from '#lib';
import { CredentialType, type Credential } from '@churros/db/prisma';
import { isPast } from 'date-fns';

function tokenSessionKey(token: Credential['value']): string {
  return `token:${token}`;
}

async function getTokenSessionFromCache(token: Credential['value']): Promise<SessionUser | null> {
  const uid = await redisClient()
    .get(tokenSessionKey(token))
    .catch((error) => {
      console.error(`Failed to get token session from cache: ${error?.toString()}`);
    });

  if (!uid) return null;

  return getSessionUser(uid);
}

async function getTokenSessionFromDatabase(
  token: Credential['value'],
): Promise<SessionUser | null> {
  const credential = await prisma.credential.findFirst({
    where: { type: CredentialType.Token, value: token },
    include: {
      user: {
        select: { uid: true },
      },
    },
  });

  if (!credential?.user) return null;

  if (credential.expiresAt !== null && isPast(credential.expiresAt))
    await prisma.credential.delete({ where: { id: credential.id } });

  await redisClient()
    .multi()
    .set(tokenSessionKey(token), credential.user.uid)
    .expire(
      tokenSessionKey(token),
      credential.expiresAt ? Math.floor((credential.expiresAt.getTime() - Date.now()) / 1000) : 0,
    )
    .exec()
    .catch((error) => {
      console.error(`Failed to cache token session: ${error?.toString()}`);
    });

  return getSessionUser(credential.user.uid, token);
}

export async function getTokenSession(token: Credential['value']): Promise<SessionUser | null> {
  return (await getTokenSessionFromCache(token)) ?? (await getTokenSessionFromDatabase(token));
}

export async function purgeTokenSession(token: Credential['value']): Promise<void> {
  await redisClient()
    .del(tokenSessionKey(token))
    .catch((error) => {
      console.error(`Failed to purge token session: ${error?.toString()}`);
    });
}
