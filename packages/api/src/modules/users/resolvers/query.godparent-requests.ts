import { builder, prisma } from '#lib';
import {} from '#modules/global';
import { GodparentRequestType } from '../index.js';

builder.queryField('godparentRequests', (t) =>
  t.prismaField({
    type: [GodparentRequestType],
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin || user?.canEditUsers);
    },
    async resolve(query) {
      return prisma.godparentRequest.findMany({
        ...query,
        orderBy: { updatedAt: 'desc' },
      });
    },
  }),
);
