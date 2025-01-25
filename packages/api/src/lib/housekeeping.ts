import { APPLE_WALLET_PASS_STORAGE_PATH, ENV, fullName, prisma, sendMail, storageRoot } from '#lib';
import { gdprExportCreationDateFromFilename, getAllGdprExports } from '#modules/users';
import { isBefore, subDays } from 'date-fns';
import { mkdir, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { rimraf } from 'rimraf';

/**
 * Delete bookings for events that have been finished for a certain amount of time, and their associated Apple Wallet pass files
 * @param thresholdDays days since event end
 */
export async function housekeepBookings(thresholdDays: number) {
  const toDelete = await prisma.registration.findMany({
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

  const deletionResults = prisma.registration.deleteMany({
    where: {
      id: { in: toDelete.map((r) => r.id) },
    },
  });

  return {
    bookings: toDelete,
    ...deletionResults,
  };
}

/**
 * Delete Apple Wallet pass files & resources
 */
export async function housekeepAppleWallet() {
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
export async function housekeepUsers(thresholdDays: number) {
  const toDelete = await prisma.user.findMany({
    where: {
      bot: false,
      lastSeenAt: {
        lt: subDays(new Date(), thresholdDays),
      },
    },
  });
  const deletionResults = prisma.user.deleteMany({
    where: {
      id: { in: toDelete.map((u) => u.id) },
    },
  });

  return {
    users: toDelete,
    ...deletionResults,
  };
}

/**
 * Warn users by email that will have their account deleted in thresholdDays/2 days
 * @param thresholdDays days since last login
 */
export async function warnUsersToHousekeep(thresholdDays: number) {
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

export async function housekeepNotifications(thresholdDays: number) {
  return prisma.notification.deleteMany({
    where: {
      createdAt: {
        lt: subDays(new Date(), thresholdDays),
      },
    },
  });
}

export async function housekeepLogs(thresholdDays: number) {
  return prisma.logEntry.deleteMany({
    where: {
      happenedAt: {
        lt: subDays(new Date(), thresholdDays),
      },
    },
  });
}

export async function housekeepGdprExports(thresholdDays: number) {
  const exportPaths = await getAllGdprExports();
  const thresholdDate = subDays(new Date(), thresholdDays);
  const toDelete = exportPaths.filter((exportPath) =>
    isBefore(gdprExportCreationDateFromFilename(path.basename(exportPath)), thresholdDate),
  );
  await Promise.all(
    toDelete.map(async (exportPath) => {
      await unlink(exportPath);
    }),
  );
  return toDelete;
}
