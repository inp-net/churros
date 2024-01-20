import { builder, prisma } from '#lib';

import { UserCandidateType } from '../index.js';

builder.queryField('userCandidate', (t) =>
  t.prismaField({
    type: UserCandidateType,
    args: { token: t.arg.string() },
    resolve: async (query, _, { token }) =>
      prisma.userCandidate.findUniqueOrThrow({ ...query, where: { token } }),
  }),
);
