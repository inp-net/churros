import { prisma } from '#lib';
import type { MaybePromise } from '@pothos/core';
import { type Group, type GroupMember, type Major, type School, type User } from '@prisma/client';
import { Cron } from 'croner';
import { nanoid } from 'nanoid';
import type { PushNotification } from './push-notification.js';
import { notify, notifyInBulk } from './send.js';

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
