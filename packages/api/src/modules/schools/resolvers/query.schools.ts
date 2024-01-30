import { builder, prisma } from '#lib';

import { SchoolType } from '../index.js';

builder.queryField('schools', (t) =>
  t.prismaField({
    type: [SchoolType],
    resolve: async (query) => prisma.school.findMany({ ...query, orderBy: { name: 'asc' } }),
  }),
);
