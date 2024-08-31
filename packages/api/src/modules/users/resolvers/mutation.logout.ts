import { builder, prisma, purgeTokenSession } from '#lib';

import { CredentialType as CredentialPrismaType } from '@churros/db/prisma';
import { GraphQLError } from 'graphql';

builder.mutationField('logout', (t) =>
  t.authField({
    description: 'Logs a user out and invalidates the session token.',
    type: 'Boolean',
    authScopes: { loggedIn: true },
    async resolve(_, {}, { user }) {
      if (!user.credential) throw new GraphQLError('User was not authenticated with a token.');

      await prisma.credential.deleteMany({
        where: { type: CredentialPrismaType.Token, value: user.credential },
      });
      await purgeTokenSession(user.credential);
      return true;
    },
  }),
);
