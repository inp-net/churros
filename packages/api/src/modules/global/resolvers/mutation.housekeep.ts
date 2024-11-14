import {
  log as _log,
  builder,
  ENV,
  environmentSchema,
  graphinx,
  housekeepAppleWallet,
  housekeepBookings,
  housekeepGdprExports,
  housekeepLogs,
  housekeepNotifications,
  housekeepUsers,
  warnUsersToHousekeep,
} from '#lib';
import { GraphQLError } from 'graphql';

builder.mutationField('housekeep', (t) =>
  t.field({
    type: Result,
    errors: {
      directResult: true,
    },
    description:
      'Run housekeeping tasks: remove bookings on old events, remove old users (no login since a certain time), apple wallet pass files, etc.',
    args: {
      token: t.arg.string({
        description: 'Housekeeper token',
        validate: {
          schema: environmentSchema.shape.HOUSEKEEPER_TOKEN.unwrap(),
        },
      }),
      thresholds: t.arg({
        type: builder.inputType('HousekeepingExpirationThresholds', {
          ...graphinx('global'),
          fields: (t) => ({
            eventEndedAt: t.int({
              description: "Number of days since event's end to remove bookings",
              validate: { min: 30 },
            }),
            userLastLogin: t.int({
              description: 'Number of days since last login to remove users',
              validate: { min: 30 },
            }),
            notificationSentAt: t.int({
              description: 'Number of days since a notification was sent to remove it',
              validate: { min: 30 },
            }),
            logHappenedAt: t.int({
              description: 'Number of days since a log was created to remove it',
              validate: { min: 30 },
            }),
            gdprExportCreatedAt: t.int({
              description: 'Number of days since a GDPR export was created to remove it',
              validate: { min: 30 },
            }),
          }),
        }),
      }),
    },
    async resolve(_, { token, thresholds }) {
      if (!ENV.HOUSEKEEPER_TOKEN)
        throw new GraphQLError('Housekeeper token is not set in the environment');

      if (token !== ENV.HOUSEKEEPER_TOKEN) throw new GraphQLError('Invalid token');

      const log = (msg: string, payload: Record<string, unknown>) =>
        _log('housekeeping', msg, payload, null, null);

      // Run housekeeping tasks
      await log('start', { thresholds });

      await log('remove-apple-wallet-passes', {});
      const filesRemoved = await housekeepAppleWallet();
      await log('remove-apple-wallet-passes/done', { filesRemoved });

      await log('remove-expired-bookings', { treshold: thresholds.eventEndedAt });
      const bookingsRemoved = await housekeepBookings(thresholds.eventEndedAt);
      await log('remove-expired-bookings/done', { bookingsRemoved });

      await log('warn-soon-expired-users', { expireThreshold: thresholds.userLastLogin });
      const warned = await warnUsersToHousekeep(thresholds.userLastLogin);
      await log('warn-soon-expired-users/done', { warned });

      await log('remove-expired-users', { threshold: thresholds.userLastLogin });
      const usersRemoved = await housekeepUsers(thresholds.userLastLogin);
      await log('remove-expired-users/done', { usersRemoved });

      await log('clean-old-notifications', { threshold: thresholds.notificationSentAt });
      const { count } = await housekeepNotifications(thresholds.notificationSentAt);
      await log('clean-old-notifications/done', { count });

      await log('clean-old-logs', { threshold: thresholds.logHappenedAt });
      const logsRemoved = await housekeepLogs(thresholds.logHappenedAt);
      await log('clean-old-logs/done', { logsRemoved });

      await log('clean-gdpr-exports', { threshold: thresholds.gdprExportCreatedAt });
      const gdprExportsRemoved = await housekeepGdprExports(thresholds.gdprExportCreatedAt);
      await log('clean-gdpr-exports/done', { gdprExportsRemoved });

      const counts = {
        deletedEvents: bookingsRemoved.count,
        deletedUsers: usersRemoved.count,
        deletedLogs: logsRemoved.count,
        warnedUsers: warned.length,
        deletedNotifications: count,
        deletedAppleWalletFiles: filesRemoved.length,
        deletedGdprExports: gdprExportsRemoved.length,
      };

      await log('done', { counts });

      return counts;
    },
  }),
);

const Result = builder
  .objectRef<{
    deletedEvents: number;
    deletedUsers: number;
    deletedLogs: number;
    deletedGdprExports: number;
    warnedUsers: number;
    deletedNotifications: number;
    deletedAppleWalletFiles: number;
  }>('HousekeepingResult')
  .implement({
    ...graphinx('global'),
    fields: (t) => ({
      deletedEvents: t.exposeInt('deletedEvents', { description: 'Number of deleted events' }),
      deletedUsers: t.exposeInt('deletedUsers', { description: 'Number of deleted users' }),
      deletedLogs: t.exposeInt('deletedLogs', { description: 'Number of deleted logs' }),
      deletedGdprExports: t.exposeInt('deletedGdprExports', {
        description: 'Number of deleted GDPR exports',
      }),
      warnedUsers: t.exposeInt('warnedUsers', { description: 'Number of warned users' }),
      deletedNotifications: t.exposeInt('deletedNotifications', {
        description: 'Number of deleted notifications',
      }),
      deletedAppleWalletFiles: t.exposeInt('deletedAppleWalletFiles', {
        description: 'Number of deleted Apple Wallet files',
      }),
    }),
  });
