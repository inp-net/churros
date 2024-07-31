import {
  type Event,
  type EventManager,
  type Group,
  type GroupMember,
  type Major,
  type School,
  type StudentAssociation,
  type User,
} from '@churros/db/prisma';
import { hoursToSeconds } from 'date-fns';
import { Redis } from 'ioredis';

/** Keep sesssion cache keys for 31 days */
const SESSION_KEY_LIFETIME_SECONDS = hoursToSeconds(31 * 24);

export function sessionCacheKey(token: string): string {
  return `session:${token}`;
}

export function userSessionsKey(uid: User['uid']): string {
  return `userSessions:${uid}`;
}

export type CachedSession = User & { fullName: string; yearTier: number } & {
  groups: Array<GroupMember & { group: Group }>;
  major:
    | null
    | (Major & { schools: Array<School & { studentAssociations: StudentAssociation[] }> });
  managedEvents: Array<EventManager & { event: Event & { group: Group } }>;
  adminOfStudentAssociations: StudentAssociation[];
  canEditGroups: StudentAssociation[];
};

let _redisClient: Redis;

function redisClient(): Redis {
  if (_redisClient) return _redisClient;
  const redisURL = new URL(process.env.REDIS_URL || 'redis://localhost:6379');
  return (_redisClient = new Redis({
    host: redisURL.hostname,
    port: Number.parseInt(redisURL.port),
  }));
}

export async function cacheSession(token: string, session: CachedSession) {
  return redisClient()
    .multi()
    .call('JSON.SET', sessionCacheKey(token), '$', JSON.stringify(session))
    .expire(sessionCacheKey(token), SESSION_KEY_LIFETIME_SECONDS)
    .sadd(userSessionsKey(session.uid), token)
    .exec()
    .catch((error) => {
      console.error(`Failed to cache session for ${token}: ${error?.toString()}`);
    });
}

export async function getCachedSession(token: string): Promise<CachedSession | null> {
  return redisClient()
    .call('JSON.GET', sessionCacheKey(token), '$')
    .then((json) => (json && typeof json === 'string' ? JSON.parse(json).at(0) : null))
    .catch((error) => {
      console.error(`Failed to get cached session for ${token}: ${error?.toString()}`);
      return null;
    });
}

export async function purgeUserSessions(uid: User['uid']) {
  const keysToDelete = await redisClient()
    .smembers(userSessionsKey(uid))
    .then((keys) => keys.map(sessionCacheKey));

  console.info(`Purging sessions ${JSON.stringify(keysToDelete)} for user ${uid}`);

  return redisClient()
    .multi(keysToDelete.map((key) => ['del', key]))
    .del(userSessionsKey(uid))
    .exec();
}
