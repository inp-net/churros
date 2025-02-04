import { builder, prisma } from '#lib';
import { NotificationChannel } from '@churros/db/prisma';
import { Event as NotellaEvent } from '@inp-net/notella';
import { GraphQLError } from 'graphql';
import { notify, queueNotification } from '../index.js';

builder.mutationField('testNotification', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      subscriptionEndpoint: t.arg.string(),
    },
    async resolve(_, { subscriptionEndpoint }) {
      const subscription = await prisma.notificationSubscription.findUnique({
        where: { endpoint: subscriptionEndpoint },
      });
      if (!subscription) throw new GraphQLError('Subscription not found');

      // remove when notella confirmed
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
            channel: NotificationChannel.Other,
            group: undefined,
            goto: 'https://www.youtube.com/watch?v=chaLRQZKi6w&t=7',
          },
        },
      );
      // end remove when notella confirmed

      await queueNotification({
        title: 'Test notification',
        body: 'Its working!!',
        action: '/notifications',
        object_id: subscription.id,
        event: NotellaEvent.Test,
      });

      return true;
    },
  }),
);
