import { builder, objectValuesFlat, prisma } from '#lib';

import { userIsAdminOf } from '#permissions';
import { GodparentRequestType } from '../index.js';

builder.queryField('godparentRequest', (t) =>
  t.prismaField({
    type: GodparentRequestType,
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      if (!user) return false;
      const request = await prisma.godparentRequest.findUniqueOrThrow({
        where: { id },
        select: {
          godchildId: true,
          godparentId: true,
          godparent: {
            select: {
              major: {
                select: {
                  schools: {
                    select: {
                      studentAssociations: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!request) return false;
      return Boolean(
        userIsAdminOf(user, objectValuesFlat(request.godparent)) ||
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
