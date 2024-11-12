import { APPLE_WALLET_PASS_STORAGE_PATH, ENV, fullName, prisma, sendMail, storageRoot } from '#lib';
import { subDays } from 'date-fns';
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { rimraf } from 'rimraf';

/**
 * Delete bookings for events that have been finished for a certain amount of time, and their associated Apple Wallet pass files
 * @param thresholdDays days since event end
 */
export async function removeOldBookings(thresholdDays: number) {
  return prisma.registration.deleteMany({
    where: {
      ticket: {
        event: {
          endsAt: {
            lt: subDays(new Date(), thresholdDays),
          },
        },
      },
    },
  });
}

/**
 * Delete Apple Wallet pass files & resources
 */
export async function removeAppleWalletFiles() {
  const directory = path.join(storageRoot(), APPLE_WALLET_PASS_STORAGE_PATH);
  const files = await readdir(directory);

  await rimraf(directory);
  await mkdir(directory);

  return files;
}

/**
 * Delete users that have not been seen for a certain amount of time
 * @param thresholdDays days since last login
 */
export async function removeOldUsers(thresholdDays: number) {
  return prisma.user.deleteMany({
    where: {
      bot: false,
      lastSeenAt: {
        lt: subDays(new Date(), thresholdDays),
      },
    },
  });
}

/**
 * Warn users by email that will have their account deleted in thresholdDays/2 days
 * @param thresholdDays days since last login
 */
export async function warnSoonOldUsers(thresholdDays: number) {
  const daysLeft = Math.floor(thresholdDays / 2);

  const usersToWarn = await prisma.user.findMany({
    where: {
      bot: false,
      lastSeenAt: {
        lt: subDays(new Date(), daysLeft),
      },
    },
  });

  for (const user of usersToWarn) {
    await sendMail(
      'account-expires-soon',
      [user.email, ...(user.schoolEmail ? [user.schoolEmail] : []), ...user.otherEmails],
      {
        daysLeft,
        fullName: fullName(user),
        loginLink: `${ENV.PUBLIC_FRONTEND_ORIGIN}/login`,
        privacyPolicyLink: `${ENV.PUBLIC_FRONTEND_ORIGIN}/privacy-policy`,
      },
      {},
    );
  }

  return usersToWarn;
}
