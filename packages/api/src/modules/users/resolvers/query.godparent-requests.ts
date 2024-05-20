import { builder, prisma } from '#lib';
import { GraphQLError } from 'graphql';

import { GodparentRequestType } from '../index.js';
import { prismaUserFilterForStudentAssociationAdmins } from '../utils/permissions.js';

builder.queryField('godparentRequests', (t) =>
  t.prismaField({
    type: [GodparentRequestType],
    authScopes: { admin: true, studentAssociationAdmin: true },
    async resolve(query, _, {}, { user }) {
      if (!user) throw new GraphQLError("Vous n'êtes pas connecté·e");
      return prisma.godparentRequest.findMany({
        ...query,
        orderBy: { updatedAt: 'desc' },
        where: { godparent: { ...prismaUserFilterForStudentAssociationAdmins(user) } },
      });
    },
  }),
);
