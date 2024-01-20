import { builder, prisma } from '#lib';

import { GodparentRequestType } from '../index.js';

builder.queryField('godparentRequest', (t) =>
  t.prismaField({
    type: GodparentRequestType,
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      if (!user) return false;
      const request = await prisma.godparentRequest.findUnique({
        where: { id },
      });
      if (!request) return false;
      return Boolean(
        user.admin ||
          user.canEditUsers ||
          [request.godchildId, request.godparentId].includes(user.id),
      );
    },
    async resolve(query, _, { id }) {
      return prisma.godparentRequest.findUniqueOrThrow({
        ...query,
        where: { id },
      });
    },
  }),
);
