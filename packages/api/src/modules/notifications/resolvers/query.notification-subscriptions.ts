import { builder, prisma } from '#lib';

import { GraphQLError } from 'graphql';
import { NotificationSubscriptionType } from '../index.js';

builder.queryField('notificationSubscriptions', (t) =>
  t.prismaField({
    type: [NotificationSubscriptionType],
    args: {},
    async resolve(query, _, {}, { user }) {
      if (!user) throw new GraphQLError('You must be logged in.');

      return prisma.notificationSubscription.findMany({
        ...query,
        where: {
          owner: {
            id: user.id,
          },
        },
      });
    },
  }),
);
