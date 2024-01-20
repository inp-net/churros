import { builder, prisma } from '#lib';

import { UserCandidateType } from '../index.js';
// TODO merge with query.user-candidate

builder.queryField('userCandidateByEmail', (t) =>
  t.prismaField({
    type: UserCandidateType,
    authScopes: { canEditUsers: true },
    args: { email: t.arg.string() },
    resolve: async (query, _, { email }) =>
      prisma.userCandidate.findUniqueOrThrow({ ...query, where: { email } }),
  }),
);
