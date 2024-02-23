import { builder, prisma } from '#lib';

import { GraphQLError } from 'graphql';
import { NotificationChannel, NotificationType } from '../index.js';

builder.queryField('notifications', (t) =>
  t.prismaConnection({
    type: NotificationType,
    cursor: 'id',
    args: {
      subscriptionEndpoint: t.arg.id({ required: false }),
      groupUids: t.arg({ type: ['String'], required: false, defaultValue: [] }),
      channels: t.arg({ type: [NotificationChannel], required: false, defaultValue: [] }),
    },
    authScopes: { loggedIn: true },
    async resolve(query, _, { groupUids, subscriptionEndpoint, channels }, { user }) {
      if (!user) throw new GraphQLError('You must be logged in.');
      return prisma.notification.findMany({
        ...query,
        where: {
          subscription: subscriptionEndpoint
            ? { endpoint: subscriptionEndpoint }
            : {
                owner: {
                  id: user.id,
                },
              },
          groupId: (groupUids ?? []).length > 0 ? { in: groupUids! } : undefined,
          channel: (channels ?? []).length > 0 ? { in: channels! } : undefined,
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  }),
);
