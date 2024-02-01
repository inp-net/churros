import { builder } from '#lib';
import { visibleEventsPrismaQuery } from '#permissions';

builder.prismaObjectField('Group', 'ownEvents', (t) =>
  t.relation('events', {
    query(_, { user }) {
      return {
        where: visibleEventsPrismaQuery(user),
        orderBy: { startsAt: 'desc' },
      };
    },
  }),
);
