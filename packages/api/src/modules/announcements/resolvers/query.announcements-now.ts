import { builder, prisma, subscriptionName } from '#lib';
import { AnnouncementType } from '../index.js';

builder.queryField('announcementsNow', (t) =>
  t.prismaField({
    type: [AnnouncementType],
    authScopes() {
      return true;
    },
    smartSubscription: true,
    subscribe(subs) {
      subs.register(subscriptionName('Announcement', 'created'));
      subs.register(subscriptionName('Announcement', 'updated'));
      subs.register(subscriptionName('Announcement', 'deleted'));
    },
    async resolve(query) {
      return prisma.announcement.findMany({
        ...query,
        where: {
          startsAt: { lte: new Date() },
          endsAt: { gte: new Date() },
        },
        orderBy: { startsAt: 'desc' },
      });
    },
  }),
);
