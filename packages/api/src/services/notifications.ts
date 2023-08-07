import {
  type Group,
  type NotificationSubscription,
  NotificationType,
  type Ticket,
  type User,
  Visibility,
  type NotificationSetting,
  type GroupMember,
  type Major,
  type School,
} from '@prisma/client';
import * as htmlToText from 'html-to-text';
import { prisma } from '../prisma.js';
import webpush, { WebPushError } from 'web-push';
import { Cron } from 'croner';
import type { MaybePromise } from '@pothos/core';
import { Prisma } from '@prisma/client';
import { toHtml } from './markdown.js';
import { differenceInSeconds, minutesToSeconds, subMinutes } from 'date-fns';
import { fullName } from '../objects/users.js';

if (process.env.CONTACT_EMAIL && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.CONTACT_EMAIL}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export type PushNotification = {
  title: string;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  badge?: string;
  icon?: string;
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
    subscriptionName?: string;
    goto: string;
  };
};

export const scheduledNotificationID = (type: NotificationType, objectId: string) =>
  `notification/${type}/${objectId}`;

export async function scheduleNewArticleNotification({
  id,
  publishedAt,
  eager,
}: {
  id: string;
  publishedAt: Date;
  eager: boolean;
}): Promise<Cron | boolean> {
  const ellipsis = (text: string) =>
    `${text
      .split(
        '\n'
      )[0]! /* the separator is not the empty string so there's no way to get an empty array of of String#split */
      .slice(0, 100)}…`;

  return scheduleNotification(
    async (user) => {
      const article = await prisma.article.findUnique({
        where: { id },
        include: {
          group: {
            include: {
              school: true,
              studentAssociation: {
                include: {
                  school: true,
                },
              },
            },
          },
        },
      });

      // If the article does not exist anymore
      if (!article) return;
      // If the article was set to private or unlisted
      if (article.visibility === Visibility.Unlisted || article.visibility === Visibility.Private)
        return;
      // If the article's group is not in a school the user is in
      if (
        !user.major.schools.some(
          (school) =>
            school.id === (article.group.school?.id ?? article.group.studentAssociation?.school.id)
        )
      )
        return;
      // If the article was set to restricted and/or the user is not in the group anymore
      if (
        article.visibility === Visibility.Restricted &&
        !user.groups.some(({ group }) => group.id === article.groupId)
      )
        return;

      return {
        title: `Nouvel article de ${article.group.name}: ${article.title}`,
        body: ellipsis(htmlToText.convert(await toHtml(article.body))),
        data: {
          group: article.group.uid,
          type: NotificationType.NewArticle,
          goto: `/club/${article.group.uid}/post/${article.uid}`,
        },
      };
    },
    {
      type: NotificationType.NewArticle,
      at: publishedAt,
      objectId: id,
      eager,
    }
  );
}

export async function scheduleShotgunNotifications({
  id,
  tickets,
}: {
  id: string;
  tickets: Ticket[];
}): Promise<SizedArray<Cron | boolean, 4> | undefined> {
  if (tickets.length === 0) return;
  const soonDate = (date: Date) => subMinutes(date, 10);

  const opensAt = new Date(
    Math.min(...tickets.map(({ opensAt }) => opensAt?.valueOf() ?? Number.POSITIVE_INFINITY))
  );

  const closesAt = new Date(
    Math.min(...tickets.map(({ closesAt }) => closesAt?.valueOf() ?? Number.POSITIVE_INFINITY))
  );

  // All 4 notifications are sensibly the same
  const makeNotification =
    (type: NotificationType) =>
    async (
      user: User & {
        major: Major & { schools: School[] };
        groups: Array<GroupMember & { group: Group }>;
      }
    ) => {
      const event = await prisma.event.findUnique({
        where: {
          id,
        },
        include: {
          tickets: true,
          group: {
            include: {
              studentAssociation: {
                include: {
                  school: true,
                },
              },
              school: true,
            },
          },
        },
      });

      // Don't send if event does not exist anymore
      if (!event) return;

      // Don't send if the event is not open to any school the user is in
      const schoolOfEvent = event.group.school ?? event.group.studentAssociation?.school;
      if (!user.major.schools.some((school) => school.id === schoolOfEvent?.id)) return;

      // Don't send notifications for unlisted or private events
      if (event.visibility === Visibility.Unlisted || event.visibility === Visibility.Private)
        return;

      // Don't send if the event is unlisted and the recipient is not in the group
      if (
        event.visibility === Visibility.Restricted &&
        !user.groups.some(({ group }) => group.id === event.groupId)
      )
        return;

      // For closing notifications, don't send if the user has registered a ticket
      if (type === NotificationType.ShotgunClosingSoon || type === NotificationType.ShotgunClosed) {
        const registration = await prisma.registration.findFirst({
          where: {
            ticket: {
              eventId: id,
            },
            paid: true,
            OR: [
              {
                authorId: user.id,
                beneficiary: '',
              },
              {
                beneficiary: user.uid,
              },
              {
                beneficiary: fullName(user),
              },
            ],
          },
        });
        if (registration) return;
      }

      const notification: PushNotification = {
        title: '',
        body: '',
        data: {
          group: event.group.uid,
          type,
          goto: `/club/${event.group.uid}/event/${event.uid}`,
        },
        image: event.pictureFile,
      };

      const openedShotgunActions: PushNotification['actions'] = [
        {
          action: `/club/${event.group.uid}/event/${event.uid}`,
          title: 'Go !',
        },
      ];

      switch (type) {
        case NotificationType.ShotgunOpeningSoon: {
          notification.title = `Le shotgun pour ${event.title} ouvre bientôt !`;
          notification.body = `À vos marques`;
          notification.timestamp = opensAt.valueOf();
          break;
        }

        case NotificationType.ShotgunOpened: {
          notification.title = `La chasse est ouverte !`;
          notification.body = `Viens prendre ta place pour ${event.title}`;
          notification.actions = openedShotgunActions;
          break;
        }

        case NotificationType.ShotgunClosingSoon: {
          notification.title = `Le shotgun pour ${event.title} ferme bientôt !`;
          notification.body = `Dépêche-toi`;
          notification.timestamp = closesAt.valueOf();
          notification.actions = openedShotgunActions;
          break;
        }

        case NotificationType.ShotgunClosed: {
          notification.title = `Le shotgun pour ${event.title} est fermé !`;
          notification.body = `Trop tard`;
          break;
        }

        default: {
          break;
        }
      }

      return notification;
    };

  return [
    await scheduleNotification(makeNotification(NotificationType.ShotgunOpeningSoon), {
      at: soonDate(opensAt),
      type: NotificationType.ShotgunOpeningSoon,
      objectId: id,
      // Only show the soon notification if the shotgun is opening in more than 2 minutes, else there's no point.
      eager: differenceInSeconds(new Date(), opensAt) > minutesToSeconds(2),
    }),
    await scheduleNotification(makeNotification(NotificationType.ShotgunOpened), {
      at: opensAt,
      type: NotificationType.ShotgunOpened,
      objectId: id,
      eager: true,
    }),
    await scheduleNotification(makeNotification(NotificationType.ShotgunClosingSoon), {
      at: soonDate(closesAt),
      type: NotificationType.ShotgunClosingSoon,
      objectId: id,
      // Only show the soon notification if the shotgun is closing in more than 2 minutes, else there's no point.
      eager: differenceInSeconds(new Date(), closesAt) > minutesToSeconds(2),
    }),
    await scheduleNotification(makeNotification(NotificationType.ShotgunClosed), {
      at: closesAt,
      type: NotificationType.ShotgunClosed,
      objectId: id,
      eager: true,
    }),
  ];
}

/**
 * @param notification A function that returns a PushNotification to send, or undefined to send
 *   nothing and cancel the job.
 * @param options.type Notification type
 * @param options.objectId ID of the object to which the notification is related. Together with
 *   `options.type`, this is used to identify the cron job associated with the notification.
 * @param options.at Date at which the notification should be sent
 * @param options.eager If true, the notification will be sent immediately if `options.at` is in the
 *   past
 * @returns The created job, false if no notification was sent and true if notifications were sent
 *   eagerly
 */
export async function scheduleNotification(
  notification: (
    user: User & {
      major: Major & { schools: School[] };
      groups: Array<GroupMember & { group: Group }>;
    }
  ) => MaybePromise<PushNotification | undefined>,
  {
    at,
    type,
    objectId,
    eager = false,
  }: {
    at: Date;
    type: NotificationType;
    objectId: string;
    eager?: boolean;
  }
): Promise<Cron | boolean> {
  const id = scheduledNotificationID(type, objectId);
  if (at.valueOf() <= Date.now() && !eager) {
    console.log(`[cron ${id}] Not scheduling notification in the past and eager is false`);
    return false;
  }

  if (Cron.scheduledJobs.some((job) => job.name === id)) {
    console.log(`[cron ${id}] Cancelling existing job`);
    Cron.scheduledJobs.find((job) => job.name === id)?.stop();
  }

  const users = await prisma.user.findMany({
    include: { groups: { include: { group: true } }, major: { include: { schools: true } } },
  });

  if (at.valueOf() <= Date.now()) {
    console.log(
      `[cron ${id}] Sending notification immediately (time is ${at.toISOString()} and now is ${new Date().toISOString()})`
    );
    // Start the promise in the background, don't wait for all notifications to be sent out, it takes approx 30 secondes in a real scenario to notify all users for e.g. a public article
    void notifyInBulk(id, users, notification);
    return true;
  }

  console.log(`[cron ${id}] Starting cron job for ${at.toISOString()}`);
  const job = new Cron(
    at,
    {
      name: id,
    },
    async () => {
      for (const user of users) {
        console.log(
          `[cron ${id} @ ${user.uid}] Sending notification (time is ${at.toISOString()})`
        );
        const notificationToSend = await notification(user);
        if (notificationToSend) await notify([user], { tag: id, ...notificationToSend });
      }
    }
  );
  return job;
}

export async function notifyInBulk<U extends User>(
  jobId: string,
  users: U[],
  notification: (user: U) => MaybePromise<PushNotification | undefined>
) {
  for (const user of users) {
    const notificationToSend = await notification(user);
    if (notificationToSend) {
      console.log(
        `[cron ${jobId} @ ${user.uid}] Sending notification ${JSON.stringify(notificationToSend)}`
      );
      await notify([user], notificationToSend);
    }
  }
}

export async function notify<U extends User>(
  users: U[],
  notification: PushNotification | ((user: U) => MaybePromise<PushNotification>)
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

  for (const subscription of subscriptions) {
    const { endpoint, authKey, p256dhKey, id } = subscription;
    const owner = users.find(({ id }) => id === subscription.owner.id);
    if (!owner) continue;
    let notif = typeof notification === 'function' ? await notification(owner) : notification;
    notif = {
      badge: '/monochrome-icon.png',
      icon: '/favicon.png',
      ...notif,
    };
    notif.data.subscriptionName = subscription.name;
    if (
      !canSendNotificationToUser(
        subscription.owner.notificationSettings,
        notif.data.type,
        notif.data.group
      )
    ) {
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
          goto: notif.data.goto,
          type: notif.data.type,
          ...(notif.data.group ? { group: { connect: { uid: notif.data.group } } } : {}),
        },
      });
      sentSubscriptions.push(subscription);
    } catch (error: unknown) {
      if (error instanceof WebPushError) {
        console.error(
          `[${notif.data.type} on ${notif.data.group ?? 'global'} @ ${
            owner.id
          }] ${error.body.trim()}`
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

    console.log(
      `[${notif.tag ?? '(untagged)'}] notification sent to ${
        subscription.owner.uid
      } with data ${JSON.stringify(notif)} (sub ${id} @ ${endpoint})`
    );
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

type SizedArray<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _TupleOf<T, N, []>
  : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;
