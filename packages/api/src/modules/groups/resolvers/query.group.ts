import { builder, prisma } from '#lib';
import { GroupType } from '../index.js';

builder.queryField('group', (t) =>
  t.prismaField({
    type: GroupType,
    args: { uid: t.arg.string() },
    async resolve(query, _, { uid }) {
      const group = await prisma.group.findUniqueOrThrow({
        ...query,
        where: { uid },
      });
      return group;
    },
  }),
);
