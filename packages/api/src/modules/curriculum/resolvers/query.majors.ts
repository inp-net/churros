import { builder, prisma } from '#lib';
import { MajorType } from '../index.js';

builder.queryField('majors', (t) =>
  t.prismaField({
    type: [MajorType],
    args: {
      discontinued: t.arg.boolean({
        defaultValue: false,
        description: "Inclure les filières anciennes n'existant plus dans les cursus actuels",
      }),
    },
    resolve: async (query, _, { discontinued }) =>
      prisma.major.findMany({
        ...query,
        where: discontinued ? {} : { discontinued: false },
        orderBy: { name: 'asc' },
      }),
  }),
);
