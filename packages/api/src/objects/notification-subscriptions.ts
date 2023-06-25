import { GraphQLError } from 'graphql';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { DateTimeScalar } from './scalars.js';

export const NotificationSubscriptionType = builder.prismaObject('NotificationSubscription', {
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    expiresAt: t.expose('expiresAt', { type: 'DateTime', nullable: true }),
    endpoint: t.exposeString('endpoint'),
    ownerId: t.exposeID('ownerId'),
    owner: t.relation('owner'),
    name: t.exposeString('name'),
  }),
});

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
  })
);

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
  })
);

builder.mutationField('upsertNotificationSubscription', (t) =>
  t.prismaField({
    type: NotificationSubscriptionType,
    args: {
      name: t.arg.string(),
      endpoint: t.arg.string(),
      expiresAt: t.arg({ type: DateTimeScalar, required: false }),
      keys: t.arg({
        type: builder.inputType('NotificationSubscriptionKeysInput', {
          fields: (t) => ({
            auth: t.string(),
            p256dh: t.string(),
          }),
        }),
      }),
    },
    async resolve(query, _, { endpoint, name, expiresAt, keys }, { user }) {
      if (!user) throw new GraphQLError('You must be logged in.');
      const subscription = await prisma.notificationSubscription.findFirst({
        where: {
          endpoint,
        },
      });

      if (subscription && subscription.ownerId !== user.id)
        throw new GraphQLError('This subscription does not belong to you.');

      const upsertData = {
        name,
        endpoint,
        owner: {
          connect: {
            id: user.id,
          },
        },
        expiresAt,
        authKey: keys.auth,
        p256dhKey: keys.p256dh,
      };
      return prisma.notificationSubscription.upsert({
        ...query,
        where: { endpoint },
        create: upsertData,
        update: upsertData,
      });
    },
  })
);

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
  })
);
