import { builder, prisma } from '#lib';

import { GraphQLError } from 'graphql';
import { NotificationSubscriptionType } from '../index.js';

builder.queryField('notificationSubscription', (t) =>
  t.prismaField({
    type: NotificationSubscriptionType,
    args: {
      endpoint: t.arg.string(),
    },
    async resolve(query, _, { endpoint }, { user }) {
      if (!user) throw new GraphQLError('You must be logged in.');

      return prisma.notificationSubscription.findFirstOrThrow({
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
