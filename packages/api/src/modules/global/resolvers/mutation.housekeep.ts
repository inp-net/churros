import {
  builder,
  deleteOldNotifications,
  ENV,
  environmentSchema,
  graphinx,
  log,
  removeAppleWalletFiles,
  removeOldBookings,
  removeOldUsers,
  warnSoonOldUsers,
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
            eventEnd: t.int({
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
          }),
        }),
      }),
    },
    async resolve(_, { token, thresholds }) {
      if (!ENV.HOUSEKEEPER_TOKEN)
        throw new GraphQLError('Housekeeper token is not set in the environment');

      if (token !== ENV.HOUSEKEEPER_TOKEN) throw new GraphQLError('Invalid token');

      // Run housekeeping tasks
      await log('housekeeping', 'start', { thresholds }, null, null);

      await log('housekeeping', 'remove-apple-wallet-passes', {}, null, null);
      const filesRemoved = await removeAppleWalletFiles();
      await log('housekeeping', 'remove-apple-wallet-passes/done', { filesRemoved }, null, null);

      await log(
        'housekeeping',
        'remove-expired-bookings',
        { treshold: thresholds.eventEnd },
        null,
        null,
      );
      const bookingsRemoved = await removeOldBookings(thresholds.eventEnd);
      await log('housekeeping', 'remove-expired-bookings/done', { bookingsRemoved }, null, null);

      await log(
        'housekeeping',
        'warn-soon-expired-users',
        { expireThreshold: thresholds.userLastLogin },
        null,
        null,
      );
      const warned = await warnSoonOldUsers(thresholds.userLastLogin);
      await log('housekeeping', 'warn-soon-expired-users/done', { warned }, null, null);

      await log(
        'housekeeping',
        'remove-expired-users',
        { threshold: thresholds.userLastLogin },
        null,
        null,
      );
      const usersRemoved = await removeOldUsers(thresholds.userLastLogin);
      await log('housekeeping', 'remove-expired-users/done', { usersRemoved }, null, null);

      await log(
        'housekeeping',
        'clean-old-notifications',
        { threshold: thresholds.notificationSentAt },
        null,
        null,
      );
      const { count } = await deleteOldNotifications(thresholds.notificationSentAt);
      await log('housekeeping', 'clean-old-notifications/done', { count }, null, null);

      return {
        deletedEvents: bookingsRemoved.count,
        deletedUsers: usersRemoved.count,
        warnedUsers: warned.length,
        deletedNotifications: count,
        deletedAppleWalletFiles: filesRemoved.length,
      };
    },
  }),
);

const Result = builder
  .objectRef<{
    deletedEvents: number;
    deletedUsers: number;
    warnedUsers: number;
    deletedNotifications: number;
    deletedAppleWalletFiles: number;
  }>('HousekeepingResult')
  .implement({
    ...graphinx('global'),
    fields: (t) => ({
      deletedEvents: t.exposeInt('deletedEvents', { description: 'Number of deleted events' }),
      deletedUsers: t.exposeInt('deletedUsers', { description: 'Number of deleted users' }),
      warnedUsers: t.exposeInt('warnedUsers', { description: 'Number of warned users' }),
      deletedNotifications: t.exposeInt('deletedNotifications', {
        description: 'Number of deleted notifications',
      }),
      deletedAppleWalletFiles: t.exposeInt('deletedAppleWalletFiles', {
        description: 'Number of deleted Apple Wallet files',
      }),
    }),
  });
