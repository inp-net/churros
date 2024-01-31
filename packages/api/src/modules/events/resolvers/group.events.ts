import { builder, prisma } from '#lib';
import {} from '#modules/global';
import { visibleEventsPrismaQuery } from '#permissions';
import { EventType } from '../index.js';

builder.prismaObjectField('Group', 'events', (t) =>
  t.prismaConnection({
    type: EventType,
    cursor: 'id',
    async resolve(_, { id }, {}, { user }) {
      return prisma.event.findMany({
        where: {
          AND: [
            { ...visibleEventsPrismaQuery(user) },
            { OR: [{ groupId: id }, { coOrganizers: { some: { id } } }] },
          ],
        },
        orderBy: { startsAt: 'desc' },
      });
    },
  }),
);
