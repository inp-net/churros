import type { NotificationSubscription } from '@prisma/client';

/* Counts the number of given subscriptions, discarding user duplicates (only one subcsription per user is counted) */
export function userUniqueSubscriptionsCount(subscriptions: NotificationSubscription[]): number {
  const uniqueSubscriptions = new Set();
  for (const subscription of subscriptions) uniqueSubscriptions.add(subscription.ownerId);

  return uniqueSubscriptions.size;
}
