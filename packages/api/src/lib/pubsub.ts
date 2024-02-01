import { createRedisEventTarget } from '@graphql-yoga/redis-event-target';
import { createPubSub } from 'graphql-yoga';
import { Redis } from 'ioredis';
import { splitID } from './global-id.js';

const REDIS_URL = new URL(process.env.REDIS_URL);

export const publishClient = new Redis({
  host: REDIS_URL.hostname,
  port: Number.parseInt(REDIS_URL.port),
});

export const subscribeClient = new Redis({
  host: REDIS_URL.hostname,
  port: Number.parseInt(REDIS_URL.port),
});

export const pubsub = createPubSub({
  eventTarget: createRedisEventTarget({ publishClient, subscribeClient }),
});

export function publish<T>(
  id: string,
  action: 'created' | 'updated' | 'deleted',
  payload: T,
  discriminant?: string,
) {
  const [typename, localId] = splitID(id);

  console.info(
    `Publishing ${action} on ${typename}:${localId} ${
      discriminant ? `@${discriminant}` : ''
    } (${subscriptionName(id, action, discriminant)})`,
  );
  if (action && discriminant) pubsub.publish(subscriptionName(id, action, discriminant), payload);
  if (discriminant) pubsub.publish(subscriptionName(typename, undefined, discriminant), payload);
  if (action) pubsub.publish(subscriptionName(typename, action), payload);
  pubsub.publish(subscriptionName(id), payload);
}

export function subscriptionName(
  idOrTypename: string,
  action?: 'created' | 'updated' | 'deleted',
  discriminant?: string,
): string {
  if (idOrTypename.includes(':')) {
    const [typename, localId] = splitID(idOrTypename);
    return `${typename}${discriminant ? `@${discriminant}` : ''}/${localId}${
      action ? `#${action}` : ''
    }`;
  }

  if (!action && !discriminant) {
    throw new Error(
      `Invalid subscription name: ${idOrTypename} (cannot subscribe on all actions for all objects of a type without a discriminant)`,
    );
  }

  return idOrTypename + (discriminant ? `@${discriminant}` : '') + (action ? `#${action}` : '');
}
