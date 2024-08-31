import { builder, prisma, purgeTokenSession } from '#lib';

import { CredentialType as CredentialPrismaType } from '@churros/db/prisma';

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
    async resolve(_, { id }) {
      const { value } = await prisma.credential.findUniqueOrThrow({
        where: { id },
        select: { value: true },
      });
      await prisma.credential.delete({ where: { id } });
      purgeTokenSession(value);
      return true;
    },
  }),
);
