import { builder } from '#lib';
import { GroupType } from '#modules/groups';

builder.prismaObjectField(GroupType, 'forms', (t) =>
  t.relation('forms', {
    description: 'Formulaires associés au groupe',
    query: {
      where: { visibility: { not: 'Unlisted' } },
      orderBy: { createdAt: 'desc' },
    },
  }),
);
