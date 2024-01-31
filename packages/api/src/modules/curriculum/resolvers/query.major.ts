import { builder, prisma } from '#lib';
import { MajorType } from '../index.js';
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
