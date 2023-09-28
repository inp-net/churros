import {
  type Group,
  type NotificationSubscription,
  type Ticket,
  type User,
  Visibility,
  type GroupMember,
  type Major,
  type School,
  NotificationChannel,
} from '@prisma/client';
import { htmlToText } from './markdown.js';
import { prisma } from '../prisma.js';
import webpush, { WebPushError } from 'web-push';
import { Cron } from 'croner';
import type { MaybePromise } from '@pothos/core';
import { Prisma } from '@prisma/client';
import { toHtml } from './markdown.js';
import { format, subMinutes } from 'date-fns';
import { fullName } from '../objects/users.js';
import { mappedGetAncestors } from 'arborist';
import { nanoid } from 'nanoid';

if (
  process.env.PUBLIC_CONTACT_EMAIL &&
  process.env.PUBLIC_VAPID_KEY &&
  process.env.VAPID_PRIVATE_KEY
) {
  webpush.setVapidDetails(
    `mailto:${process.env.PUBLIC_CONTACT_EMAIL}`,
    process.env.PUBLIC_VAPID_KEY,
    process.env.VAPID_PRIVATE_KEY,
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
    channel: NotificationChannel;
    subscriptionName?: string;
    goto: string;
  };
};

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
        '\n',
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
            school.id === (article.group.school?.id ?? article.group.studentAssociation?.school.id),
        )
      )
        return;
      // If the article was set to restricted and/or the user is not in the group anymore
      if (article.visibility === Visibility.Restricted) {
        // Get the user's groups and their ancestors
        const ancestors = await prisma.group
          // Get all groups in the same family as the user's groups
          .findMany({
            where: { familyId: { in: user.groups.map(({ group }) => group.familyId ?? group.id) } },
            select: { id: true, parentId: true, uid: true },
          })
          // Get all ancestors of the groups
          .then((groups) => mappedGetAncestors(groups, user.groups, { mappedKey: 'groupId' }))
          // Flatten the ancestors into a single array
          .then((groups) => groups.flat());

        if (!ancestors.some(({ uid }) => uid === article.group.uid)) return;
      }

      return {
        title: `Nouveau post de ${article.group.name}: ${article.title}`,
        body: ellipsis(htmlToText(await toHtml(article.body))),
        data: {
          group: article.group.uid,
          channel: NotificationChannel.Articles,
          goto: `/posts/${article.group.uid}/${article.uid}`,
        },
      };
    },
    {
      at: publishedAt,
      eager,
    },
  );
}

export async function scheduleShotgunNotifications({
  id,
  tickets,
}: {
  id: string;
  tickets: Ticket[];
}): Promise<[Cron | boolean, Cron | boolean] | undefined> {
  if (tickets.length === 0) return;
  const soonDate = (date: Date) => subMinutes(date, 10);

  const opensAt = new Date(
    Math.min(...tickets.map(({ opensAt }) => opensAt?.valueOf() ?? Number.POSITIVE_INFINITY)),
  );

  const closesAt = new Date(
    Math.min(...tickets.map(({ closesAt }) => closesAt?.valueOf() ?? Number.POSITIVE_INFINITY)),
  );

  // All 4 notifications are sensibly the same
  const makeNotification =
    (type: 'Closing' | 'Opening') =>
    async (
      user: User & {
        major: Major & { schools: School[] };
        groups: Array<GroupMember & { group: Group }>;
      },
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
      if (type === 'Closing') {
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
          channel: NotificationChannel.Shotguns,
          goto: `/events/${event.group.uid}/${event.uid}`,
        },
        image: event.pictureFile,
      };

      const openedShotgunActions: PushNotification['actions'] = [
        {
          action: `/events/${event.group.uid}/${event.uid}`,
          title: 'Go !',
        },
      ];

      switch (type) {
        case 'Opening': {
          notification.title = `Shotgun pour ${event.title}`;
          notification.body = `Prépare-toi, il ouvre à ${format(opensAt, 'HH:mm')}`;
          notification.timestamp = opensAt.valueOf();
          break;
        }

        case 'Closing': {
          notification.title = `Shotgun pour ${event.title}`;
          notification.body = `Attention, il ferme à ${format(closesAt, 'HH:mm')}, dépeches-toi !`;
          notification.timestamp = closesAt.valueOf();
          notification.actions = openedShotgunActions;
          break;
        }

        default: {
          break;
        }
      }

      return notification;
    };

  return [
    await scheduleNotification(makeNotification('Opening'), {
      at: soonDate(opensAt),
      eager: true,
    }),
    await scheduleNotification(makeNotification('Closing'), {
      at: soonDate(closesAt),
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
    },
  ) => MaybePromise<PushNotification | undefined>,
  {
    at,
    eager = false,
  }: {
    at: Date;
    eager?: boolean;
  },
): Promise<Cron | boolean> {
  const id = nanoid();
  if (at.valueOf() <= Date.now() && !eager) {
    console.info(`[cron ${id}] Not scheduling notification in the past and eager is false`);
    return false;
  }

  if (Cron.scheduledJobs.some((job) => job.name === id)) {
    console.info(`[cron ${id}] Cancelling existing job`);
    Cron.scheduledJobs.find((job) => job.name === id)?.stop();
  }

  const users = await prisma.user.findMany({
    include: { groups: { include: { group: true } }, major: { include: { schools: true } } },
  });

  if (at.valueOf() <= Date.now()) {
    console.info(
      `[cron ${id}] Sending notification immediately (time is ${at.toISOString()} and now is ${new Date().toISOString()})`,
    );
    // Start the promise in the background, don't wait for all notifications to be sent out, it takes approx 30 secondes in a real scenario to notify all users for e.g. a public article
    void notifyInBulk(id, users, notification);
    return true;
  }

  console.info(`[cron ${id}] Starting cron job for ${at.toISOString()}`);
  const job = new Cron(
    at,
    {
      name: id,
    },
    async () => {
      for (const user of users) {
        console.info(
          `[cron ${id} @ ${user.uid}] Sending notification (time is ${at.toISOString()})`,
        );
        const notificationToSend = await notification(user);
        if (notificationToSend) await notify([user], { tag: id, ...notificationToSend });
      }
    },
  );
  return job;
}

export async function notifyInBulk<U extends User>(
  jobId: string,
  users: U[],
  notification: (user: U) => MaybePromise<PushNotification | undefined>,
) {
  for (const user of users) {
    const notificationToSend = await notification(user);
    if (notificationToSend) {
      console.info(
        `[cron ${jobId} @ ${user.uid}] Sending notification ${JSON.stringify(notificationToSend)}`,
      );
      await notify([user], notificationToSend);
    }
  }
}

export async function notify<U extends User>(
  users: U[],
  notification: PushNotification | ((user: U) => MaybePromise<PushNotification>),
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
      if (!canSendNotificationToUser(subscription.owner, notif.data.channel)) {
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

export function canSendNotificationToUser(
  subscriptionOwner: { enabledNotificationChannels: NotificationChannel[] },
  channel: NotificationChannel,
): boolean {
  return (
    subscriptionOwner.enabledNotificationChannels.includes(channel) ||
    subscriptionOwner.enabledNotificationChannels.length === 0
  );
}
