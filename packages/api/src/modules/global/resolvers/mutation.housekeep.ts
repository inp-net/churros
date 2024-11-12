import {
  builder,
  ENV,
  log,
  removeAppleWalletFiles,
  removeOldBookings,
  removeOldUsers,
  warnSoonOldUsers,
} from '#lib';
import { GraphQLError } from 'graphql';

builder.mutationField('housekeep', (t) =>
  t.boolean({
    errors: {},
    description:
      'Run housekeeping tasks: remove bookings on old events, remove old users (no login since a certain time), apple wallet pass files, etc.',
    args: {
      token: t.arg.string({
        description: 'Housekeeper token',
        // validate: environmentSchema.shape.HOUSEKEEPER_TOKEN,
      }),
      expiredEventsDaysThreshold: t.arg.int({
        description: "Number of days since event's end to remove bookings",
        validate: { min: 30 },
      }),
      expiredUsersDaysThreshold: t.arg.int({
        description: 'Number of days since last login to remove users',
        validate: { min: 30 },
      }),
    },
    async resolve(_, { token, expiredEventsDaysThreshold, expiredUsersDaysThreshold }) {
      if (!ENV.HOUSEKEEPER_TOKEN)
        throw new GraphQLError('Housekeeper token is not set in the environment');

      if (token !== ENV.HOUSEKEEPER_TOKEN) throw new GraphQLError('Invalid token');

      // Run housekeeping tasks
      await log(
        'housekeeping',
        'start',
        { expiredEventsDaysThreshold, expiredUsersDaysThreshold },
        null,
        null,
      );

      await log('housekeeping', 'remove-apple-wallet-passes', {}, null, null);
      const filesRemoved = await removeAppleWalletFiles();
      await log('housekeeping', 'remove-apple-wallet-passes/done', { filesRemoved }, null, null);

      await log(
        'housekeeping',
        'remove-expired-bookings',
        { expiredEventsDaysThreshold },
        null,
        null,
      );
      const bookingsRemoved = await removeOldBookings(expiredEventsDaysThreshold);
      await log('housekeeping', 'remove-expired-bookings/done', { bookingsRemoved }, null, null);

      await log(
        'housekeeping',
        'warn-soon-expired-users',
        { expiredUsersDaysThreshold },
        null,
        null,
      );
      const warned = await warnSoonOldUsers(expiredUsersDaysThreshold);
      await log('housekeeping', 'warn-soon-expired-users/done', { warned }, null, null);

      await log('housekeeping', 'remove-expired-users', { expiredUsersDaysThreshold }, null, null);
      const usersRemoved = await removeOldUsers(expiredUsersDaysThreshold);
      await log('housekeeping', 'remove-expired-users/done', { usersRemoved }, null, null);

      return true;
    },
  }),
);
