import { ENV, prisma } from '#lib';
import { serverCanSendNotificationToUser } from '#permissions';
import type { NotificationChannel } from '@churros/db/prisma';
import {
  type Group,
  type GroupMember,
  type Major,
  type NotificationSubscription,
  type School,
  type User,
} from '@churros/db/prisma';
import type { MaybePromise } from '@pothos/core';
import { Cron } from 'croner';
import firebase from 'firebase-admin';
import { FirebaseMessagingError } from 'firebase-admin/messaging';
import { nanoid } from 'nanoid';
import webpush, { WebPushError } from 'web-push';

export function setVapidDetails() {
  if (ENV.PUBLIC_CONTACT_EMAIL && ENV.PUBLIC_VAPID_KEY && ENV.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      `mailto:${ENV.PUBLIC_CONTACT_EMAIL}`,
      ENV.PUBLIC_VAPID_KEY,
      ENV.VAPID_PRIVATE_KEY,
    );
  }
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

const firebaseApp = ENV.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY
  ? firebase.initializeApp({
      credential: firebase.credential.cert({
        clientEmail: ENV.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY.client_email,
        privateKey: ENV.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY.private_key,
        projectId: ENV.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY.project_id,
      }),
    })
  : undefined;

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
      ownerId: { in: users.map(({ id }) => id) },
    },
    include: {
      owner: true,
    },
  });

  const sentSubscriptions: typeof subscriptions = [];

  await Promise.all(
    subscriptions.map(async (subscription) => {
      const owner = users.find(({ id }) => id === subscription.owner.id);
      if (!owner) return;

      let notif = typeof notification === 'function' ? await notification(owner) : notification;

      notif = {
        badge: '/logo-masked.png',
        ...notif,
        data: {
          ...notif.data,
          subscriptionName: subscription.name,
        },
      };

      if (!serverCanSendNotificationToUser(subscription.owner, notif.data.channel)) {
        console.info(
          logsPrefix(subscription, notif),
          `Skipping since user has disabled ${notif.data.channel} notifications`,
        );
        return;
      }

      try {
        await sendNotification(subscription, notif);
        await storeSentNotificationInDatabase(subscription, notif);
        sentSubscriptions.push(subscription);
      } catch (error: unknown) {
        if (isSubscriptionExpiredError(error)) await deleteSubscription(subscription.endpoint);
        else console.error(logsPrefix(subscription, notif), error);
      }

      console.info(
        logsPrefix(subscription, notif),
        `notification sent with data ${JSON.stringify(notif)}`,
      );
    }),
  );

  return sentSubscriptions;
}

async function sendNotification(sub: NotificationSubscription, notification: PushNotification) {
  return isWebPushEndpoint(sub.endpoint)
    ? sendWebPushNotification(sub, notification)
    : sendNativePushNotification(sub, notification);
}

/**
 * WebPush endpoints are URLs, while native push endpoints are just formatted as `apns://TOKEN` or `firebase://TOKEN`.
 * @param endpoint the endpoint to test
 * @returns true if the endpoint corresponds to a web push endpoint
 */
function isWebPushEndpoint(endpoint: string) {
  return /^https?:/.test(endpoint);
}

async function sendWebPushNotification(
  sub: NotificationSubscription,
  notification: PushNotification,
) {
  await webpush.sendNotification(
    {
      endpoint: sub.endpoint,
      keys: {
        auth: sub.authKey,
        p256dh: sub.p256dhKey,
      },
    },
    JSON.stringify(notification),
    {
      vapidDetails: {
        subject: `mailto:${ENV.PUBLIC_CONTACT_EMAIL}`,
        publicKey: ENV.PUBLIC_VAPID_KEY,
        privateKey: ENV.VAPID_PRIVATE_KEY,
      },
    },
  );
}

async function sendNativePushNotification(
  sub: NotificationSubscription,
  notification: PushNotification,
) {
  const token = sub.endpoint.replace(/^\w+:\/\//, '');
  if (!firebaseApp) throw new MissingFirebaseCredentialsError();
  await firebaseApp.messaging().send({
    token,
    data: {
      original: JSON.stringify(notification),
    },
    android: {
      restrictedPackageName: ENV.PUBLIC_APP_PACKAGE_ID,
      notification: {
        vibrateTimingsMillis: notification.vibrate,
        eventTimestamp: notification.timestamp ? new Date(notification.timestamp) : undefined,
        clickAction: notification.actions?.[0]?.title,
      },
    },
    notification: {
      title: notification.title,
      body: notification.body,
      imageUrl: notification.image,
    },
  });
}

async function storeSentNotificationInDatabase(
  sub: NotificationSubscription,
  notification: PushNotification,
) {
  await prisma.notification.create({
    data: {
      subscription: {
        connect: {
          id: sub.id,
        },
      },
      timestamp: notification.timestamp ? new Date(notification.timestamp) : new Date(),
      actions: {
        createMany: {
          data: (notification.actions ?? [])
            .filter(({ action }) => /^https?:\/\//.test(action))
            .map(({ action, title }) => ({
              value: action,
              name: title,
            })),
        },
      },
      title: notification.title,
      body: notification.body,
      imageFile: notification.image,
      vibrate: notification.vibrate,
      goto: notification.data.goto,
      channel: notification.data.channel,
      ...(notification.data.group ? { group: { connect: { uid: notification.data.group } } } : {}),
    },
  });
}

function logsPrefix(sub: NotificationSubscription, notif: PushNotification) {
  return `[${notif.data.channel} on ${notif.data.group ?? 'global'} for ${sub.ownerId} @ ${sub.endpoint}]`;
}

function isSubscriptionExpiredError(
  error: unknown,
): error is WebPushError | FirebaseMessagingError {
  return (
    (error instanceof WebPushError &&
      error.body.trim() === 'push subscription has unsubscribed or expired.') ||
    (error instanceof FirebaseMessagingError &&
      error.code === 'messaging/registration-token-not-registered')
  );
}

async function deleteSubscription(endpoint: string) {
  // Use deleteMany so that if the endpoint is not found, it doesn't cause an error
  await prisma.notificationSubscription.deleteMany({ where: { endpoint } });
}

class MissingFirebaseCredentialsError extends Error {
  constructor() {
    super('Missing firebase admin credentials');
  }
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
 * @param option.dryRun print to the console but don't send anything
 * @returns The created job, false if no notification was sent and true if notifications were sent
 *   eagerly
 */
export async function scheduleNotification(
  notification: (
    user: User & {
      major: null | (Major & { schools: School[] });
      groups: Array<GroupMember & { group: Group }>;
    },
  ) => MaybePromise<(PushNotification & { afterSent: () => Promise<void> }) | undefined>,
  {
    at,
    eager = false,
    dryRun = false,
  }: {
    at: Date;
    eager?: boolean;
    dryRun?: boolean;
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
    if (dryRun) {
      console.info(
        `[cron ${id}] (dry run) would schedule ${JSON.stringify(notification)} to ${
          users.length
        } users (${users.map(({ uid }) => `@${uid}`).join(' ')})`,
      );
      return false;
    }

    await notifyInBulk(id, users, notification);
    return true;
  }

  if (dryRun) {
    console.info(
      `[cron ${id}] (dry run) would schedule at ${at.toISOString()} <${JSON.stringify(
        notification,
      )}> to ${users.length} users (${users.map(({ uid }) => `@${uid}`).join(' ')})`,
    );
    return false;
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
        if (notificationToSend) {
          const { afterSent, ...notificationData } = notificationToSend;
          await notify([user], { tag: id, ...notificationData });
          await afterSent();
        }
      }
    },
  );
  return job;
}
