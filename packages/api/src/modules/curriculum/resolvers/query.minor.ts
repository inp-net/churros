import { builder, prisma } from '#lib';
import { MinorType } from '../index.js';

builder.queryField('minor', (t) =>
  t.prismaField({
    type: MinorType,
    args: {
      id: t.arg.id(),
    },
    authScopes: () => true,
    async resolve(query, _, { id }) {
      return prisma.minor.findUniqueOrThrow({
        ...query,
        where: { id },
      });
    },
  }),
);
