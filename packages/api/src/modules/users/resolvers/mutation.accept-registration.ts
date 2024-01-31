import { builder, prisma } from '#lib';

import { saveUser } from '../index.js';
// TODO rename to accept-user-candidate

builder.mutationField('acceptRegistration', (t) =>
  t.field({
    authScopes: { canEditUsers: true },
    type: 'Boolean',
    args: { email: t.arg.string() },
    async resolve(_, { email }, { user }) {
      const candidate = await prisma.userCandidate.findUniqueOrThrow({ where: { email } });
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
      return true;
    },
  }),
);
