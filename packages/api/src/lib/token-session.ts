import { prisma, redisClient } from '#lib';
import { CredentialType, type Credential } from '@churros/db/prisma';
import { getUserSession, type UserSession } from './user-session.js';

function tokenSessionKey(token: Credential['value']): string {
  return `token:${token}`;
}

async function getTokenSessionFromCache(token: Credential['value']): Promise<UserSession | null> {
  const uid = await redisClient()
    .get(tokenSessionKey(token))
    .catch((error) => {
      console.error(`Failed to get token session from cache: ${error?.toString()}`);
    });

  if (!uid) return null;

  return getUserSession(uid);
}

async function getTokenSessionFromDatabase(token: Credential['value']): Promise<UserSession> {
  const credential = await prisma.credential.findFirstOrThrow({
    where: { type: CredentialType.Token, value: token },
    include: {
      user: {
        select: { uid: true },
      },
    },
  });

  if (credential.expiresAt !== null && credential.expiresAt < new Date()) 
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

  return getUserSession(credential.user.uid);
}

export async function getTokenSession(token: Credential['value']): Promise<UserSession | null> {
  return (await getTokenSessionFromCache(token)) ?? (await getTokenSessionFromDatabase(token));
}

export async function purgeTokenSession(token: Credential['value']): Promise<void> {
  await redisClient()
    .del(tokenSessionKey(token))
    .catch((error) => {
      console.error(`Failed to purge token session: ${error?.toString()}`);
    });
}
