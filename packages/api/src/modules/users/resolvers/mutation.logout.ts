import { builder, prisma, purgeUserSessions } from '#lib';

import { CredentialType as CredentialPrismaType } from '@prisma/client';

builder.mutationField('logout', (t) =>
  t.authField({
    description: 'Logs a user out and invalidates the session token.',
    type: 'Boolean',
    authScopes: { loggedIn: true },
    async resolve(_, {}, { user, token }) {
      await prisma.credential.deleteMany({
        where: { type: CredentialPrismaType.Token, value: token },
      });
      purgeUserSessions(user.uid);
      return true;
    },
  }),
);
