import { builder } from '../builder.js';
import { prisma } from '../prisma.js';

export const SchoolType = builder.prismaObject('School', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    color: t.exposeString('color'),
  }),
});

builder.queryField('schools', (t) =>
  t.prismaField({
    type: [SchoolType],
    resolve: async (query) => prisma.school.findMany({ ...query, orderBy: { name: 'asc' } }),
  })
);
