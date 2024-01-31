import { builder, prisma } from '#lib';
import {} from '#modules/global';
import { Visibility } from '@prisma/client';
import { EventType, visibleEventsPrismaQuery } from '../index.js';
// TODO rename to group.events

builder.queryField('eventsOfGroup', (t) =>
  t.prismaConnection({
    type: EventType,
    cursor: 'id',
    args: {
      groupUid: t.arg.string(),
    },
    async resolve(query, _, { groupUid }, { user }) {
      if (!user) {
        return prisma.event.findMany({
          ...query,
          where: { visibility: Visibility.Public, group: { uid: groupUid } },
          orderBy: { startsAt: 'desc' },
        });
      }

      return prisma.event.findMany({
        ...query,
        where: visibleEventsPrismaQuery(user),
        orderBy: { startsAt: 'desc' },
      });
    },
  }),
);
