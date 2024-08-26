import { builder, prisma } from '#lib';
import { NotificationSubscriptionType } from '#modules/notifications/types';

import { GraphQLError } from 'graphql';

builder.mutationField('unsubscribeFromNotifications', (t) =>
  t.prismaField({
    type: NotificationSubscriptionType,
    errors: {},
    args: {
      endpoint: t.arg.string(),
    },
    async resolve(query, _, { endpoint }, { user }) {
      if (!user) throw new GraphQLError('You must be logged in.');
      return prisma.notificationSubscription.delete({
        ...query,
        where: {
          endpoint,
          owner: {
            id: user.id,
          },
        },
      });
    },
  }),
);
