import { builder, prisma } from '#lib';
import { GraphQLError } from 'graphql';
import { generateThirdPartyToken } from '../auth.js';

builder.mutationField('authorize', (t) =>
  t.string({
    description:
      "Authorize a third-party client to access the user's data. Returns the token to use.",
    authScopes: { loggedIn: true },
    args: {
      clientId: t.arg.string(),
      redirectUri: t.arg.string(),
    },
    async resolve(_, { clientId }, { user }) {
      if (!user) throw new GraphQLError('Not logged in');
      // TODO store clients in the database and verify redirectUri

      const { value } = await prisma.thirdPartyCredential.create({
        data: {
          clientId,
          value: generateThirdPartyToken(),
          // Keep the token for 7 days
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          owner: { connect: { id: user.id } },
        },
      });
      return value;
    },
  }),
);
