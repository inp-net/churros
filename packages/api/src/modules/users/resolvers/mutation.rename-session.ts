import { builder, prisma } from '#lib';

import { CredentialType as CredentialPrismaType } from '@prisma/client';

// TODO third party apps also have tokens, a "Session" type should be created
// so that third party apps' sessions (authorizations) can also be revoked

builder.mutationField('renameSession', (t) =>
  t.field({
    type: 'Boolean',
    args: { id: t.arg.id(), name: t.arg({ type: 'String', defaultValue: undefined }) },
    async authScopes(_, { id }, { user }) {
      const credential = await prisma.credential.findUniqueOrThrow({
        where: { id },
      });
      if (credential.type !== CredentialPrismaType.Token) return false;
      return user?.id === credential.userId;
    },
    async resolve(_, { id, name }) {
      await prisma.credential.update({
        where: { id },
        data: { name },
      });

      return true;
    },
  }),
);
