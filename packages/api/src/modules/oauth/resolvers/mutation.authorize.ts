import { builder, ensureHasIdPrefix, isLocalNetwork, prisma } from '#lib';

import { ThirdPartyCredentialType } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { OAuth2Error, OAuth2ErrorCode, generateThirdPartyToken } from '../index.js';
// TODO rename to authorize-third-party-app

builder.mutationField('authorize', (t) =>
  t.string({
    description: `
Authorize a third-party client to access the user's data. 
Returns an access code. 

Use the frontend's /authorize endpoint instead of this, as it requires already being logged-in.

Do a \`GET\` request to \`${process.env.FRONTEND_ORIGIN}/authorize?client_id=<clientId>&redirect_uri=<redirectUri>&response_type=code&state=<state>\` with:

- \`<clientId>\`: The client ID of the app. See registerApp to get this.
- \`<redirectUri>\`: The URL that you want to redirect the user to. The frontend uses this on /authorize to redirect users to \`<redirectUri>?code=<return value of this mutation>\`
- \`<state>\`: A random string generated from personal information used to prevent CSRF attacks.

Use that code to get an access token with /token:

Do a \`POST\` request to \`${process.env.FRONTEND_ORIGIN}/token\` with a \`application/x-www-form-urlencoded\` body with the following fields:

- \`grant_type\`: \`authorization_code\`
- \`code\`: The code returned by this endpoint
- \`client_id\`: The client ID of the app
- \`client_secret\`: The client secret of the app
- \`redirect_uri\`: The redirect URI used in this request
      `,
    authScopes: { loggedIn: true },
    errors: {
      types: [OAuth2Error],
    },
    args: {
      clientId: t.arg.string({
        description: 'The client ID of the app. See registerApp to get this.',
      }),
      redirectUri: t.arg.string({
        description:
          'The URL that you want to redirect the user to. The frontend uses this on /authorize to redirect users to `<redirectUri>?code=<return value of this mutation>`',
        validate: { url: true },
      }),
    },
    async resolve(_, { clientId, redirectUri }, { user }) {
      if (!user) throw new GraphQLError('Not logged in');
      const client = await prisma.thirdPartyApp.findUniqueOrThrow({
        where: { id: ensureHasIdPrefix(clientId, 'ThirdPartyApp') },
      });

      if (!client.active && !isLocalNetwork(redirectUri)) {
        throw new OAuth2Error(
          OAuth2ErrorCode.unauthorized_client,
          `This app is not active yet. Please try again later. Contact ${process.env.PUBLIC_CONTACT_EMAIL} if your app takes more than a week to get activated.`,
        );
      }

      if (!client.allowedRedirectUris.includes(redirectUri))
        throw new GraphQLError('Invalid redirect URI');

      const [{ value }] = await prisma.$transaction([
        prisma.thirdPartyCredential.create({
          data: {
            clientId: client.id,
            value: generateThirdPartyToken(),
            type: ThirdPartyCredentialType.AuthorizationCode,
            // Keep the auth code for 7 days
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            ownerId: user.id,
          },
        }),
        prisma.thirdPartyApp.update({
          where: {
            id: client.id,
          },
          data: {
            users: {
              connect: {
                id: user.id,
              },
            },
          },
        }),
      ]);

      return value;
    },
  }),
);
