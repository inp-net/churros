import { Event, NotificationSubscription, NotificationType, User } from '@prisma/client';
import { prisma } from '../prisma';
import webpush from 'web-push';
import { CronJob } from 'cron';
import type { MaybePromise } from '@pothos/core';

webpush.setVapidDetails(
  `mailto:${process.env.CONTACT_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export type PushNotification = {
  title: string;
  actions?: Array<{ action: string; title: string; icon: string }>;
  badge: string;
  icon: string;
  image?: string;
  body: string;
  renotify?: boolean;
  requireInteraction?: boolean;
  silent?: boolean;
  tag?: string;
  timestamp?: number;
  vibrate?: number[];
  data: {
    group: string;
    type: NotificationType;
  };
};

export function scheduleNotification(
  at: Date,
  users: User[],
  notification: PushNotification | ((user: User) => MaybePromise<PushNotification>),
  cancelIf: () => MaybePromise<boolean>
): CronJob {
  const job = new CronJob(at, async () => {
    if (await cancelIf()) {
      console.log(`Job for ${at.toISOString()} cancelled`);
      return;
    }

    await notify(users, notification);
  });
  console.log(`Starting cron job for ${at.toISOString()}`);
  job.start();
  return job;
}

export async function notify(
  users: User[],
  notification: PushNotification | ((user: User) => MaybePromise<PushNotification>)
): Promise<NotificationSubscription[]> {
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

  const sentSubscriptions = [];

  for (const sub of subscriptions) {
    const { endpoint, authKey, p256dhKey, owner } = sub;
    const notif = typeof notification === 'function' ? await notification(owner) : notification;
    await webpush.sendNotification(
      {
        endpoint,
        keys: {
          auth: authKey,
          p256dh: p256dhKey,
        },
      },
      JSON.stringify(notif)
    );
    await prisma.notification.create({
      data: {
        recipientId: owner.id,
        timestamp: notif.timestamp ? new Date(notif.timestamp) : undefined,
        title: notif.title,
        body: notif.body,
        imageFile: notif.image,
        vibrate: notif.vibrate,
        type: notif.data.type,
        groupId: notif.data.group,
      },
    });
    sentSubscriptions.push(sub);
  }

  return sentSubscriptions;
}
