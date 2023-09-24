import { builder } from '../builder.js';
import { prisma } from '../prisma.js';

export const MajorType = builder.prismaObject('Major', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    uid: t.exposeString('uid'),
    shortName: t.exposeString('shortName'),
    schools: t.relation('schools', { query: { orderBy: { name: 'asc' } } }),
  }),
});

builder.queryField('majors', (t) =>
  t.prismaField({
    type: [MajorType],
    resolve: async (query) => prisma.major.findMany({ ...query, orderBy: { name: 'asc' } }),
  }),
);

builder.queryField('major', (t) =>
  t.prismaField({
    type: MajorType,
    args: {
      uid: t.arg.string({ required: true }),
    },
    resolve: async (query, _, { uid }) =>
      prisma.major.findFirstOrThrow({ where: { uid }, ...query }),
  }),
);
