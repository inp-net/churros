import { builder, prisma } from '#lib';

import { prismaQueryVisibleEvents } from '#permissions';
import { EventType } from '../index.js';

builder.prismaObjectField('Group', 'events', (t) =>
  t.prismaConnection({
    type: EventType,
    cursor: 'id',
    async resolve(_, { id }, {}, { user }) {
      return prisma.event.findMany({
        where: {
          AND: [
            { ...prismaQueryVisibleEvents(user) },
            { OR: [{ groupId: id }, { coOrganizers: { some: { id } } }] },
          ],
        },
        orderBy: { startsAt: 'desc' },
      });
    },
  }),
);
