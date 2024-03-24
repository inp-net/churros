import { builder, log, prisma } from '#lib';
import * as Google from 'google-auth-library';
import { GraphQLError } from 'graphql';

builder.mutationField('registerGoogleCredential', (t) =>
  t.boolean({
    description: "Enregistrer un token OAuth2 Google pour l'utilisateur connecté.",
    errors: {},
    args: {
      code: t.arg.string({ description: "Le code d'authorisation" }),
    },
    authScopes: { loggedIn: true },
    resolve: async (_, { code }, { user }) => {
      if (!user) throw new GraphQLError('User not found');

      const client = new Google.OAuth2Client({
        clientId: process.env.PUBLIC_GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: new URL('/connect/google/callback', process.env.FRONTEND_ORIGIN).toString(),
      });
      const { tokens } = await client.getToken(code.toString()).catch((error_) => {
        console.error(error_);
        return { tokens: { access_token: null } };
      });

      if (!tokens.access_token) throw new GraphQLError('No access token provided');

      await log('google', 'callback/ok', { tokens }, user.id, user);

      await prisma.credential.create({
        data: {
          type: 'Google',
          value: tokens.access_token,
          expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
          refresh: tokens.refresh_token ?? undefined,
          user: { connect: { id: user.id } },
        },
      });

      return true;
    },
  }),
);
