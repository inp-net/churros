import { builder } from '#lib';
import { prismaQueryVisibleEvents } from '#permissions';

builder.prismaObjectField('Group', 'coOrganizedEvents', (t) =>
  t.relation('coOrganizedEvents', {
    query: (_, { user }) => ({
      where: prismaQueryVisibleEvents(user),
      orderBy: { startsAt: 'desc' },
    }),
  }),
);
