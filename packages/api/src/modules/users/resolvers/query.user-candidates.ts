import { builder, prisma } from '#lib';

import { prismaQueryUserCandidatesForUser, UserCandidateType } from '../index.js';

builder.queryField('userCandidates', (t) =>
  t.prismaConnection({
    type: UserCandidateType,
    authScopes: { admin: true, studentAssociationAdmin: true },
    cursor: 'id',
    async totalCount(_, {}, { user }) {
      return prisma.userCandidate.count({
        where: prismaQueryUserCandidatesForUser(user),
      });
    },
    async resolve(query, _, {}, { user }) {
      return prisma.userCandidate.findMany({
        ...query,
        where: prismaQueryUserCandidatesForUser(user),
      });
    },
  }),
);
