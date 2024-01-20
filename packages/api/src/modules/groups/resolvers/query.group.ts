import { builder, prisma } from '#lib';

import { GroupType } from '../index.js';

builder.queryField('group', (t) =>
  t.prismaField({
    type: GroupType,
    args: { uid: t.arg.string() },
    resolve: async (query, _, { uid }) =>
      prisma.group.findUniqueOrThrow({ ...query, where: { uid } }),
  }),
);
