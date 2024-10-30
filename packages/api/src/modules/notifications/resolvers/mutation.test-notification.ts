import { builder, prisma } from '#lib';
import { Event as NotellaEvent } from '@inp-net/notella';
import { GraphQLError } from 'graphql';
import { queueNotification } from '../index.js';

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
      if (!subscription) 
        throw new GraphQLError('Subscription not found');
      

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
