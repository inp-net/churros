import { builder, prisma } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { GraphQLError } from 'graphql';
import { NotificationSubscriptionType } from '../index.js';
// TODO rename to mutation.subscribe-to-notifications
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
  }),
);
