import { builder, prisma } from '#lib';

import { NotificationChannel as NotificationChannelPrisma } from '@prisma/client';
import { notify } from '../index.js';

builder.mutationField('testNotification', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      subscriptionEndpoint: t.arg.string(),
    },
    async resolve(_, { subscriptionEndpoint }) {
      await notify(
        await prisma.user.findMany({
          where: {
            notificationSubscriptions: {
              some: {
                endpoint: subscriptionEndpoint,
              },
            },
          },
        }),
        {
          title: 'Test notification',
          body: 'Its working!!',
          badge: '/monochrome-icon.png',
          icon: '/favicon.png',
          actions: [],
          image: undefined,
          data: {
            channel: NotificationChannelPrisma.Other,
            group: undefined,
            goto: 'https://www.youtube.com/watch?v=chaLRQZKi6w&t=7',
          },
        },
      );
      return true;
    },
  }),
);
