import { builder, prisma, purgeUserSessions } from '#lib';

import { CredentialType as CredentialPrismaType } from '@prisma/client';

// TODO merge with mutation.logout

builder.mutationField('deleteToken', (t) =>
  t.field({
    type: 'Boolean',
    args: { id: t.arg.id() },
    async authScopes(_, { id }, { user }) {
      const credential = await prisma.credential.findUniqueOrThrow({
        where: { id },
      });
      if (credential.type !== CredentialPrismaType.Token) return false;
      return user?.id === credential.userId;
    },
    async resolve(_, { id }, { user }) {
      await prisma.credential.delete({ where: { id } });
      purgeUserSessions(user!.uid);
      return true;
    },
  }),
);
