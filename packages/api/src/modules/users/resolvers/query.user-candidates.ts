import { builder, prisma } from '#lib';

import { prismaQueryUserCandidatesForUser, UserCandidateType } from '../index.js';

builder.queryField('userCandidates', (t) =>
  t.prismaConnection({
    type: UserCandidateType,
    authScopes: { admin: true, studentAssociationAdmin: true },
    cursor: 'id',
    resolve: async (query, _, {}, { user }) => {
      return prisma.userCandidate.findMany({
        ...query,
        where: prismaQueryUserCandidatesForUser(user),
      });
    },
  }),
);
