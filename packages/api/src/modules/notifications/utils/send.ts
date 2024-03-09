import { prisma } from '#lib';

import { serverCanSendNotificationToUser } from '#permissions';
import type { MaybePromise } from '@pothos/core';
import { Prisma, type NotificationSubscription, type User } from '@prisma/client';
import webpush, { WebPushError } from 'web-push';
import { setVapidDetails } from '../index.js';
import type { PushNotification } from './push-notification.js';

export async function notifyInBulk<U extends User>(
  jobId: string,
  users: U[],
  notification: (
    user: U,
  ) => MaybePromise<(PushNotification & { afterSent: () => Promise<void> }) | undefined>,
) {
  for (const user of users) {
    const notificationToSend = await notification(user);
    if (notificationToSend) {
      const { afterSent, ...notificationData } = notificationToSend;
      console.info(
        `[cron ${jobId} @ ${user.uid}] Sending notification ${JSON.stringify(notificationData)}`,
      );
      await notify([user], notificationData);
      await afterSent();
    }
  }
}

export async function notify<U extends User>(
  users: U[],
  notification: PushNotification | ((user: U) => MaybePromise<PushNotification>),
): Promise<NotificationSubscription[]> {
  // IMPORTANT, sets the VAPID keys for webpush
  setVapidDetails();
  const subscriptions = await prisma.notificationSubscription.findMany({
    where: {
      owner: {
        id: {
          in: users.map(({ id }) => id),
        },
      },
    },
    include: {
      owner: true,
    },
  });

  const sentSubscriptions: typeof subscriptions = [];

  await Promise.all(
    subscriptions.map(async (subscription) => {
      const { endpoint, authKey, p256dhKey, id } = subscription;
      const owner = users.find(({ id }) => id === subscription.owner.id);
      if (!owner) return;
      let notif = typeof notification === 'function' ? await notification(owner) : notification;
      notif = {
        badge: '/logo-masked.png',
        ...notif,
      };
      notif.data.subscriptionName = subscription.name;
      if (!serverCanSendNotificationToUser(subscription.owner, notif.data.channel)) {
        console.info(
          `[${notif.data.channel} on ${notif.data.group ?? 'global'} @ ${
            owner.id
          }] Skipping since user has disabled ${notif.data.channel} notifications`,
        );
        return;
      }

      try {
        await webpush.sendNotification(
          {
            endpoint,
            keys: {
              auth: authKey,
              p256dh: p256dhKey,
            },
          },
          JSON.stringify(notif),
          {
            vapidDetails: {
              subject: `mailto:${process.env.PUBLIC_CONTACT_EMAIL}`,
              publicKey: process.env.PUBLIC_VAPID_KEY,
              privateKey: process.env.VAPID_PRIVATE_KEY,
            },
          },
        );
        await prisma.notification.create({
          data: {
            subscription: {
              connect: {
                id,
              },
            },
            timestamp: notif.timestamp ? new Date(notif.timestamp) : new Date(),
            actions: {
              createMany: {
                data: (notif.actions ?? [])
                  .filter(({ action }) => /^https?:\/\//.test(action))
                  .map(({ action, title }) => ({
                    value: action,
                    name: title,
                  })),
              },
            },
            title: notif.title,
            body: notif.body,
            imageFile: notif.image,
            vibrate: notif.vibrate,
            goto: notif.data.goto,
            channel: notif.data.channel,
            ...(notif.data.group ? { group: { connect: { uid: notif.data.group } } } : {}),
          },
        });
        sentSubscriptions.push(subscription);
      } catch (error: unknown) {
        if (error instanceof WebPushError) {
          console.error(
            `[${notif.data.channel} on ${notif.data.group ?? 'global'} @ ${
              owner.id
            }] ${error.body.trim()}`,
          );
        }

        if (
          error instanceof WebPushError &&
          error.body.trim() === 'push subscription has unsubscribed or expired.'
        ) {
          await prisma.notificationSubscription
            .delete({
              where: {
                endpoint,
              },
            })
            .catch((error) => {
              if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
                // Subscription was deleted in the meantime, nothing to worry about
              } else {
                throw error;
              }
            });
        }
      }

      console.info(
        `[${notif.tag ?? '(untagged)'}] notification sent to ${
          subscription.owner.uid
        } with data ${JSON.stringify(notif)} (sub ${id} @ ${endpoint})`,
      );
    }),
  );

  return sentSubscriptions;
}
