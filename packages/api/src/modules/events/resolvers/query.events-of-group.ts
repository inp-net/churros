import { builder, prisma } from '#lib';

import { prismaQueryVisibleEvents } from '#permissions';
import { Visibility } from '@prisma/client';
import { EventType } from '../index.js';
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
        where: prismaQueryVisibleEvents(user),
        orderBy: { startsAt: 'desc' },
      });
    },
  }),
);
