import { builder, prisma } from '#lib';

import { saveUser, UserCandidateType } from '../index.js';
// TODO rename to accept-user-candidate

builder.mutationField('acceptRegistration', (t) =>
  t.prismaField({
    authScopes: { canEditUsers: true },
    type: UserCandidateType,
    args: { email: t.arg.string() },
    async resolve(query, _, { email }, { user }) {
      const candidate = await prisma.userCandidate.findUniqueOrThrow({
        ...query,
        where: { email },
      });
      await prisma.logEntry.create({
        data: {
          action: 'accept',
          area: 'signups',
          message: `Acceptation de l'inscription de ${email}`,
          user: { connect: { id: user!.id } },
          target: `token ${candidate.token}`,
        },
      });
      await saveUser(candidate);
      return candidate;
    },
  }),
);
