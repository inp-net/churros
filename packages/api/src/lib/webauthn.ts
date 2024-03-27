import { minutesToSeconds } from 'date-fns';
import { Redis } from 'ioredis';
import { nanoid } from 'nanoid';
import { splitID, TYPENAMES_TO_ID_PREFIXES } from './global-id.js';

export const WEBAUTHN_CHALLENGE_EXPIRATION_MINUTES = 5;
const REDIS_URL = new URL(process.env.REDIS_URL);
const redisClient = new Redis({
  host: REDIS_URL.hostname,
  port: Number.parseInt(REDIS_URL.port),
});

export async function makeChallenge(identifier: string): Promise<string> {
  const challenge = nanoid(32);
  await redisClient.setex(
    identifier,
    minutesToSeconds(WEBAUTHN_CHALLENGE_EXPIRATION_MINUTES),
    challenge,
  );
  return challenge;
}

export async function getChallenge(identifier: string): Promise<string | null> {
  return redisClient.get(identifier);
}

export const WEBAUTHN_RELYING_PARTY = {
  id: new URL(process.env.FRONTEND_ORIGIN).hostname,
  name: 'Churros',
} as const;

/**
 * simplewebauthn requires passing around public key IDs as Buffers.
 * We encode them as Base64 strings for our global IDs.
 * @param id the Base64-encoded public key ID
 * @returns
 */
export function databaseToWebauthnKeyId(id: string): Buffer {
  const [_, localId] = splitID(id);
  return Buffer.from(localId, 'base64');
}

/**
 * Decode a public key ID from a Base64 string to a global ID, to store in the database.
 * If the ID is a string, it is assumed to be Base64-encoded.
 */
export function webauthnToDatabaseKeyId(id: Uint8Array | string): string {
  const base64dID =
    typeof id === 'string'
      ? // we re-encode to base64 to ensure padding is present (simplewebauthn sends the ID without padding)
        Buffer.from(id, 'base64').toString('base64')
      : Buffer.from(id).toString('base64');

  return `${TYPENAMES_TO_ID_PREFIXES.Credential}:${base64dID}`;
}
