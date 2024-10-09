import { ENV, prisma } from '#lib';
import { serverCanSendNotificationToUser } from '#permissions';
import { type NotificationSubscription, type User } from '@churros/db/prisma';
import type { MaybePromise } from '@pothos/core';
import firebase from 'firebase-admin';
import { FirebaseMessagingError } from 'firebase-admin/messaging';
import webpush, { WebPushError } from 'web-push';
import type { PushNotification } from './push-notification.js';
import { setVapidDetails } from './vapid.js';

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
