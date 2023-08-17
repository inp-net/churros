import { GraphQLError } from 'graphql';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { DateTimeScalar } from './scalars.js';
import { NotificationType as NotificationTypePrisma } from '@prisma/client';
import { notify } from '../services/notifications.js';

export const NotificationTypeEnum = builder.enumType(NotificationTypePrisma, {
  name: 'NotificationType',
});

export const NotificationType = builder.prismaNode('Notification', {
  id: { field: 'id' },
  fields: (t) => ({
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    timestamp: t.expose('timestamp', { type: DateTimeScalar, nullable: true }),
    groupId: t.exposeID('groupId', { nullable: true }),
    group: t.relation('group', { nullable: true }),
    subscriptionId: t.exposeID('subscriptionId'),
    subscription: t.relation('subscription'),
    vibrate: t.expose('vibrate', { type: ['Int'] }),
    body: t.exposeString('body'),
    title: t.exposeString('title'),
    imageFile: t.exposeString('imageFile'),
    type: t.expose('type', { type: NotificationTypeEnum }),
    actions: t.relation('actions'),
    goto: t.exposeString('goto'),
  }),
});

builder.queryField('notifications', (t) =>
  t.prismaConnection({
    type: NotificationType,
    cursor: 'id',
    args: {
      subscriptionEndpoint: t.arg.id({ required: false }),
      groupUids: t.arg({ type: ['String'], required: false, defaultValue: [] }),
      types: t.arg({ type: [NotificationTypeEnum], required: false, defaultValue: [] }),
    },
    authScopes: { loggedIn: true },
    async resolve(query, _, { groupUids, subscriptionEndpoint, types }, { user }) {
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
          type: (types ?? []).length > 0 ? { in: types! } : undefined,
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  })
);

builder.queryField('notification', (t) =>
  t.prismaField({
    type: NotificationType,
    args: {
      id: t.arg.id(),
    },
    authScopes: { loggedIn: true },
    async resolve(query, _, { id }, { user }) {
      return prisma.notification.findFirstOrThrow({
        ...query,
        where: { id, subscription: { ownerId: user?.id } },
      });
    },
  })
);

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
          include: { notificationSettings: true },
        }),
        {
          title: 'Test notification',
          body: 'Its working!!',
          badge: '/monochrome-icon.png',
          icon: '/favicon.png',
          actions: [],
          image: undefined,
          data: {
            type: NotificationTypePrisma.Other,
            group: undefined,
            goto: 'https://www.youtube.com/watch?v=chaLRQZKi6w&t=7',
          },
        }
      );
      return true;
    },
  })
);
