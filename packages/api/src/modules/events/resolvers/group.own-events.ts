import { builder } from '#lib';
import { prismaQueryVisibleEvents } from '#permissions';

builder.prismaObjectField('Group', 'ownEvents', (t) =>
  t.relation('events', {
    query(_, { user }) {
      return {
        where: prismaQueryVisibleEvents(user),
        orderBy: { startsAt: 'desc' },
      };
    },
  }),
);
