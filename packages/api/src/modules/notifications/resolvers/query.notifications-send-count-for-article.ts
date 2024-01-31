import { builder, prisma } from '#lib';
import { VisibilityEnum } from '#modules/global';
import { NotificationChannel as NotificationChannelPrisma, Visibility } from '@prisma/client';
import { userUniqueSubscriptionsCount } from '../index.js';
// TODO rename to article.notification-send-count

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
