import { builder, prisma } from '#lib';
import { MajorType } from '../index.js';

builder.queryField('majors', (t) =>
  t.prismaField({
    type: [MajorType],
    resolve: async (query) => prisma.major.findMany({ ...query, orderBy: { name: 'asc' } }),
  }),
);
