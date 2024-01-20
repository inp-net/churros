import { builder } from '#lib';
import { visibleEventsPrismaQuery } from '#permissions';

builder.prismaObjectField('Group', 'coOrganizedEvents', (t) =>
  t.relation('coOrganizedEvents', {
    query: (_, { user }) => ({
      where: visibleEventsPrismaQuery(user),
      orderBy: { startsAt: 'desc' },
    }),
  }),
);
