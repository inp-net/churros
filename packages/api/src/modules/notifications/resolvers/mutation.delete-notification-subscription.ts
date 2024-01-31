import { builder, prisma } from '#lib';

import { GraphQLError } from 'graphql';

// TODO rename to mutation.unsubscribe-from-notifications
builder.mutationField('deleteNotificationSubscription', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      endpoint: t.arg.string(),
    },
    async resolve(_, { endpoint }, { user }) {
      if (!user) throw new GraphQLError('You must be logged in.');
      await prisma.notificationSubscription.deleteMany({
        where: {
          endpoint,
          owner: {
            id: user.id,
          },
        },
      });
      return true;
    },
  }),
);
