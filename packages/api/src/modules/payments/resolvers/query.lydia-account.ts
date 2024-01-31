import { builder, prisma } from '#lib';
import {} from '#modules/global';
import { LydiaAccountType } from '../index.js';

builder.queryField('lydiaAccount', (t) =>
  t.prismaField({
    type: LydiaAccountType,
    args: {
      id: t.arg.id(),
    },
    resolve: async (query, _, { id }) =>
      prisma.lydiaAccount.findFirstOrThrow({ ...query, where: { id } }),
  }),
);
