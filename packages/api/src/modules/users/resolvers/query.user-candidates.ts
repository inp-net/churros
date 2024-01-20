import { builder, prisma } from '#lib';

import { UserCandidateType } from '../index.js';

builder.queryField('userCandidates', (t) =>
  t.prismaConnection({
    type: UserCandidateType,
    authScopes: { canEditUsers: true },
    cursor: 'id',
    resolve: async (query) =>
      prisma.userCandidate.findMany({ ...query, where: { emailValidated: true } }),
  }),
);
