import { builder } from '../builder.js';
import { prisma } from '../prisma.js';

export const MajorType = builder.prismaObject('Major', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    shortName: t.exposeString('shortName'),
    schools: t.relation('schools', { query: { orderBy: { name: 'asc' } } }),
  }),
});

builder.queryField('majors', (t) =>
  t.prismaField({
    type: [MajorType],
    resolve: async (query) => prisma.major.findMany({ ...query, orderBy: { name: 'asc' } }),
  })
);
