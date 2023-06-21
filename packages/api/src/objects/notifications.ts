import { GraphQLError } from 'graphql';
import { builder } from '../builder';
import { prisma } from '../prisma';
import { DateTimeScalar } from './scalars';
import { NotificationType as NotificationTypePrisma } from '@prisma/client';

export const NotificationTypeEnum = builder.enumType(NotificationTypePrisma, {
  name: 'NotificationType',
});

export const NotificationType = builder.prismaNode('Notification', {
  id: { field: 'id' },
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    timestamp: t.expose('timestamp', { type: DateTimeScalar, nullable: true }),
    groupId: t.exposeID('groupId', { nullable: true }),
    group: t.relation('group', { nullable: true }),
    recipientId: t.exposeID('recipientId'),
    recipient: t.relation('recipient'),
    vibrate: t.expose('vibrate', { type: ['Int'] }),
    body: t.exposeString('body'),
    title: t.exposeString('title'),
    imageFile: t.exposeString('imageFile'),
    type: t.expose('type', { type: NotificationTypeEnum }),
  }),
});

builder.queryField('notifications', (t) =>
  t.prismaConnection({
    type: NotificationType,
    cursor: 'id',
    args: {
      groupUids: t.arg({ type: ['String'] }),
      types: t.arg({ type: [NotificationTypeEnum] }),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user);
    },
    async resolve(query, _, { groupUids, types }, { user }) {
      if (!user) throw new GraphQLError('You must be logged in.');
      return prisma.notification.findMany({
        ...query,
        where: {
          recipientId: user.id,
          groupId: groupUids.length > 0 ? { in: groupUids } : undefined,
          type: types.length > 0 ? { in: types } : undefined,
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
    async authScopes(_, { id }, { user }) {
      // todo
    },
    async resolve(query, _, { id }, { user }) {
      return prisma.notification.findUnique({
        ...query,
        where: { id },
      });
    },
  })
);
