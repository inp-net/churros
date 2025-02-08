import { APPLE_WALLET_PASS_STORAGE_PATH, ENV, fullName, prisma, sendMail, storageRoot } from '#lib';
import { gdprExportCreationDateFromFilename, getAllGdprExports } from '#modules/users';
import { isBefore, subDays } from 'date-fns';
import { mkdir, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { rimraf } from 'rimraf';

/**
 * Delete bookings for events that have been finished for a certain amount of time, and their associated Apple Wallet pass files
 * @param thresholdDays - Days since event end
 * @param dryRun - if true, return result but don't do anything
 */
export async function housekeepBookings({
  thresholdDays,
  dryRun = false,
}: {
  thresholdDays: number;
  dryRun?: boolean;
}) {
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

  if (dryRun) return { bookings: toDelete, count: toDelete.length };

  const deletionResults = await prisma.registration.deleteMany({
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
 * @param dryRun - if true, return result but don't do anything
 */
export async function housekeepAppleWallet({ dryRun = false }: { dryRun?: boolean } = {}) {
  const directory = path.join(storageRoot(), APPLE_WALLET_PASS_STORAGE_PATH);
  const files = await readdir(directory);

  if (dryRun) return files;

  await rimraf(directory);
  await mkdir(directory);

  return files;
}

/**
 * Delete users that have not been seen for a certain amount of time
 * @param thresholdDays - Days since last login
 * @param dryRun - if true, return result but don't do anything
 */
export async function housekeepUsers({
  thresholdDays,
  dryRun = false,
}: {
  thresholdDays: number;
  dryRun?: boolean;
}) {
  const toDelete = await prisma.user.findMany({
    where: {
      bot: false,
      lastSeenAt: {
        lt: subDays(new Date(), thresholdDays),
      },
    },
  });

  if (dryRun) return { users: toDelete, count: toDelete.length };

  const deletionResults = await prisma.user.deleteMany({
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
 * @param thresholdDays - Days since last login
 * @param dryRun - if true, return result but don't do anything
 */
export async function warnUsersToHousekeep({
  thresholdDays,
  dryRun = false,
}: {
  thresholdDays: number;
  dryRun?: boolean;
}) {
  const daysLeft = Math.floor(thresholdDays / 2);

  const usersToWarn = await prisma.user.findMany({
    where: {
      bot: false,
      lastSeenAt: {
        lt: subDays(new Date(), daysLeft),
      },
    },
  });

  if (dryRun) return usersToWarn;

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

/**
 * Delete notifications older than a certain amount of time
 * @param thresholdDays - Days since notification creation
 * @param dryRun - if true, return result but don't do anything
 */
export async function housekeepNotifications({
  thresholdDays,
  dryRun = false,
}: {
  thresholdDays: number;
  dryRun?: boolean;
}) {
  if (dryRun) {
    return await prisma.notification
      .count({
        where: {
          createdAt: {
            lt: subDays(new Date(), thresholdDays),
          },
        },
      })
      .then((count) => ({ count }));
  }

  return prisma.notification.deleteMany({
    where: {
      createdAt: {
        lt: subDays(new Date(), thresholdDays),
      },
    },
  });
}

/**
 * Delete log entries older than a certain amount of time
 * @param thresholdDays - Days since log entry creation
 * @param dryRun - if true, return result but don't do anything
 */
export async function housekeepLogs({
  thresholdDays,
  dryRun = false,
}: {
  thresholdDays: number;
  dryRun?: boolean;
}) {
  if (dryRun) {
    return await prisma.logEntry
      .count({
        where: {
          happenedAt: {
            lt: subDays(new Date(), thresholdDays),
          },
        },
      })
      .then((count) => ({ count }));
  }

  return prisma.logEntry.deleteMany({
    where: {
      happenedAt: {
        lt: subDays(new Date(), thresholdDays),
      },
    },
  });
}

/**
 * Delete GDPR exports older than a certain amount of time
 * @param thresholdDays - Days since GDPR export creation
 * @param dryRun - if true, return result but don't do anything
 */
export async function housekeepGdprExports({
  thresholdDays,
  dryRun = false,
}: {
  thresholdDays: number;
  dryRun?: boolean;
}) {
  const exportPaths = await getAllGdprExports();
  const thresholdDate = subDays(new Date(), thresholdDays);
  const toDelete = exportPaths.filter((exportPath) =>
    isBefore(gdprExportCreationDateFromFilename(path.basename(exportPath)), thresholdDate),
  );

  if (dryRun) return toDelete;

  await Promise.all(
    toDelete.map(async (exportPath) => {
      await unlink(exportPath);
    }),
  );
  return toDelete;
}
