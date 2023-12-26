import { builder, prisma } from '#lib';
import {
  NotificationChannel as NotificationChannelPrisma,
  Visibility,
  type NotificationSubscription,
} from '@prisma/client';
import { GraphQLError } from 'graphql';
import { notify } from '../services/notifications.js';
import { VisibilityEnum } from './events.js';
import { DateTimeScalar } from './scalars.js';

export const NotificationChannel = builder.enumType(NotificationChannelPrisma, {
  name: 'NotificationChannel',
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
    channel: t.expose('channel', { type: NotificationChannel }),
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
  }),
);

/* Counts the number of given subscriptions, discarding user duplicates (only one subcsription per user is counted) */
function userUniqueSubscriptionsCount(subscriptions: NotificationSubscription[]): number {
  const uniqueSubscriptions = new Set();
  for (const subscription of subscriptions) uniqueSubscriptions.add(subscription.ownerId);

  return uniqueSubscriptions.size;
}

builder.queryField('notificationsSendCountForArticle', (t) =>
  t.int({
    description:
      'Returns how many people will be notified if an article of the given visibility and group is created.',
    args: {
      groupUid: t.arg.string(),
      visibility: t.arg({ type: VisibilityEnum }),
    },
    async resolve(_, { groupUid, visibility }) {
      switch (visibility) {
        // For public stuff, _everyone_ gets notified
        case Visibility.Public: {
          return userUniqueSubscriptionsCount(
            await prisma.notificationSubscription.findMany({
              where: {
                owner: {
                  enabledNotificationChannels: {
                    has: NotificationChannelPrisma.Articles,
                  },
                },
              },
            }),
          );
        }

        // For school-restricted, all users that are in majors that are in the group's studentAssociation's school get notified
        case Visibility.SchoolRestricted: {
          return userUniqueSubscriptionsCount(
            await prisma.notificationSubscription.findMany({
              where: {
                owner: {
                  enabledNotificationChannels: {
                    has: NotificationChannelPrisma.Articles,
                  },
                  major: {
                    schools: {
                      some: {
                        studentAssociations: {
                          some: {
                            groups: {
                              some: {
                                uid: groupUid,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            }),
          );
        }

        case Visibility.GroupRestricted: {
          return userUniqueSubscriptionsCount(
            await prisma.notificationSubscription.findMany({
              where: {
                owner: {
                  enabledNotificationChannels: {
                    has: NotificationChannelPrisma.Articles,
                  },
                  groups: {
                    some: {
                      group: {
                        OR: [
                          { uid: groupUid },
                          {
                            // TODO handle more than 1-nested children
                            parent: {
                              uid: groupUid,
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            }),
          );
        }

        // Unlisted and Private articles don't send any notifications
        default: {
          return 0;
        }
      }
    },
  }),
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
