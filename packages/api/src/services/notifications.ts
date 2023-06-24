import {
  type Event,
  type Group,
  type NotificationSubscription,
  NotificationType,
  type Ticket,
  type TicketGroup,
  type User,
  Visibility,
  type NotificationSetting,
} from '@prisma/client';
import { prisma } from '../prisma.js';
import webpush, { WebPushError } from 'web-push';
import { CronJob } from 'cron';
import type { MaybePromise } from '@pothos/core';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/index.js';

webpush.setVapidDetails(
  `mailto:${process.env.CONTACT_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export type PushNotification = {
  title: string;
  actions?: Array<{ action: string; title: string; icon?: string }>;
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
    group: string | undefined;
    type: NotificationType;
  };
};

export async function scheduleShotgunNotifications(
  event: Event & {
    group: Group;
    tickets: Ticket[];
    ticketGroups: Array<TicketGroup & { tickets: Ticket[] }>;
  }
): Promise<[CronJob | undefined, CronJob | undefined] | undefined> {
  if (event.visibility === Visibility.Unlisted || event.visibility === Visibility.Private) return;

  const getShotgunDate = (event: {
    tickets: Ticket[];
    ticketGroups: Array<{ tickets: Ticket[] }>;
  }) =>
    new Date(
      Math.min(
        ...event.tickets.map(({ opensAt }) => opensAt?.valueOf() ?? Number.POSITIVE_INFINITY),
        ...event.ticketGroups.flatMap(({ tickets }) =>
          tickets.map(({ opensAt }) => opensAt?.valueOf() ?? Number.POSITIVE_INFINITY)
        )
      )
    );
  const shotgunDate = getShotgunDate(event);
  if (Number.isNaN(shotgunDate.valueOf())) return;

  const allUsers = await prisma.user.findMany({
    include: { groups: true },
  });
  const recipients =
    event.visibility === Visibility.Restricted
      ? allUsers.filter(({ groups }) => groups.some(({ groupId }) => event.groupId === groupId))
      : allUsers;

  const soonDate = (date: Date) => new Date(date.valueOf() - 5 * 60 * 1000);

  const cancelIf = async () => {
    const freshEvent = await prisma.event.findUnique({
      where: {
        id: event.id,
      },
      include: {
        tickets: true,
        ticketGroups: {
          include: {
            tickets: true,
          },
        },
      },
    });
    if (!freshEvent) return true;
    if (
      freshEvent.visibility === Visibility.Unlisted ||
      freshEvent.visibility === Visibility.Private
    )
      return true;
    const freshShotgunDate = getShotgunDate(freshEvent);
    if (Number.isNaN(freshShotgunDate.valueOf())) return true;
    if (freshShotgunDate.valueOf() !== shotgunDate.valueOf()) return true;
    return false;
  };

  const soonJob = scheduleNotification(
    `shotgun-soon-${event.id}`,
    soonDate(shotgunDate),
    recipients,
    {
      badge: process.env.FRONTEND_ORIGIN + '/favicon.png',
      icon: process.env.FRONTEND_ORIGIN + '/favicon.png',
      title: `Le shotgun pour ${event.title} ouvre bientôt !`,
      body: `À vos marques`,
      data: {
        group: event.group.uid,
        type: NotificationType.ShotgunOpeningSoon,
      },
      image: event.pictureFile,
      timestamp: shotgunDate.valueOf(),
    },
    cancelIf
  );

  const nowJob = scheduleNotification(
    `shotgun-now-${event.id}`,
    shotgunDate,
    recipients,
    {
      badge: process.env.FRONTEND_ORIGIN + '/favicon.png',
      icon: process.env.FRONTEND_ORIGIN + '/favicon.png',
      title: `La chasse est ouverte !`,
      body: `Viens prendre ta place pour ${event.title}`,
      actions: [
        {
          action: process.env.FRONTEND_ORIGIN + `/club/${event.group.uid}/event/${event.uid}`,
          title: 'Go',
        },
      ],
      data: {
        group: event.group.uid,
        type: NotificationType.ShotgunOpened,
      },
      image: event.pictureFile,
      vibrate: [500, 200, 500],
    },
    cancelIf
  );

  return [soonJob, nowJob];
}

export function scheduleNotification(
  id: string,
  at: Date,
  users: User[],
  notification: PushNotification | ((user: User) => MaybePromise<PushNotification>),
  cancelIf: () => MaybePromise<boolean>
): CronJob | undefined {
  if (at.valueOf() < Date.now()) return;
  // TODO fix timezone
  const job = new CronJob(at, async () => {
    if (await cancelIf()) {
      console.log(`[cron ${id}] Job for ${at.toISOString()} cancelled`);
      return;
    }

    console.log(`[cron ${id}] Sending notification (time is ${at.toISOString()})`);
    await notify(users, notification);
  });
  console.log(`[cron ${id}] Starting cron job for ${at.toISOString()}`);
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
      owner: {
        include: {
          notificationSettings: {
            include: {
              group: true,
            },
          },
        },
      },
    },
  });

  const sentSubscriptions = [];

  for (const sub of subscriptions) {
    const { endpoint, authKey, p256dhKey, owner, id } = sub;
    const notif = typeof notification === 'function' ? await notification(owner) : notification;
    if (!canSendNotificationToUser(owner.notificationSettings, notif.data.type, notif.data.group)) {
      console.log(
        `[${notif.data.type} on ${notif.data.group ?? 'global'} @ ${
          owner.id
        }] Skipping since user has disabled ${notif.data.type} on ${
          notif.data.group ?? 'global'
        } notifications`
      );
      continue;
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
        JSON.stringify(notif)
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
              data: [
                ...(notif.actions ?? [])
                  .filter(({ action }) => /^https?:\/\//.test(action))
                  .map(({ action, title }) => ({
                    value: action,
                    name: title,
                  })),
              ],
            },
          },
          title: notif.title,
          body: notif.body,
          imageFile: notif.image,
          vibrate: notif.vibrate,
          type: notif.data.type,
          ...(notif.data.group ? { group: { connect: { uid: notif.data.group } } } : {}),
        },
      });
      sentSubscriptions.push(sub);
    } catch (error: unknown) {
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
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
              // Subscription was deleted in the meantime, nothing to worry about
            } else {
              throw error;
            }
          });
      }
    }
  }

  return sentSubscriptions;
}

export function canSendNotificationToUser(
  notificationSettings: Array<NotificationSetting & { group: Group | null }>,
  type: NotificationType,
  groupUid: string | undefined
): boolean {
  if (groupUid) {
    const groupSetting = notificationSettings.find(
      ({ type: t, group }) => t === type && group?.uid === groupUid
    );
    if (groupSetting) return groupSetting.allow;
  }

  const setting = notificationSettings.find(({ type: t }) => t === type);
  if (!setting) return false;
  if (setting.allow) return true;

  return false;
}
