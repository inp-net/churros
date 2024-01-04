import { builder, ensureHasIdPrefix, prisma, removeIdPrefix } from '#lib';
import { ThirdPartyCredentialType } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { nanoid } from 'nanoid';
import { generateThirdPartyToken } from '../auth.js';
import { userIsInBureauOf } from '../objects/groups.js';

export const ThirdPartyApp = builder.prismaObject('ThirdPartyApp', {
  description: 'A third-party OAuth2 client',
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: true }),
    name: t.exposeString('name'),
    description: t.exposeString('description'),
    website: t.exposeString('website'),
    faviconUrl: t.string({
      async resolve({ website, id }) {
        const app = await prisma.thirdPartyApp.findUniqueOrThrow({ where: { id } });
        if (app.faviconUrl) return app.faviconUrl;
        console.info(`Fetching favicon for ${website}`);
        // TODO
        // const favicon = await getFavicon(website, {
        //   timeout: 2000,
        // }).catch(() => ({ url: '' }));
        const favicon = { url: new URL(website).origin + '/favicon.ico' };
        await prisma.thirdPartyApp.update({
          where: { id: app.id },
          data: {
            faviconUrl: favicon.url,
          },
        });
        return favicon.url;
      },
    }),
    allowedRedirectUris: t.exposeStringList('allowedRedirectUris'),
    owner: t.relation('owner'),
  }),
});

builder.queryField('thirdPartyApp', (t) =>
  t.prismaField({
    type: 'ThirdPartyApp',
    args: {
      id: t.arg.id({
        description: "The third party app's client_id. The 'app:' id prefix is optional.",
      }),
    },
    async resolve(query, _, { id }) {
      return prisma.thirdPartyApp.findUniqueOrThrow({
        ...query,
        where: { id: ensureHasIdPrefix(id, 'ThirdPartyApp') },
      });
    },
  }),
);

class ThirdPartyAppRegistrationResponse {
  client_id: string;
  client_secret: string;

  constructor(client_id: string, client_secret: string) {
    this.client_id = client_id;
    this.client_secret = client_secret;
  }
}

export const ThirdPartyAppRegistrationResponseType = builder
  .objectRef<ThirdPartyAppRegistrationResponse>('ThirdPartyAppRegistrationResponse')
  .implement({
    fields: (t) => ({
      client_id: t.exposeString('client_id'),
      client_secret: t.exposeString('client_secret'),
    }),
  });

builder.mutationField('registerApp', (t) =>
  t.field({
    type: ThirdPartyAppRegistrationResponseType,
    description:
      'Register a third-party OAuth2 client. Returns the client secret. The client secret cannot be retrieved at any other time. Use refreshAppSecret to rotate your client secret.',
    args: {
      name: t.arg.string({ description: "The app's name", validate: { maxLength: 255 } }),
      description: t.arg.string({
        description: "The app's description",
        validate: { maxLength: 255 },
      }),
      allowedRedirectUris: t.arg.stringList({
        description: 'Allowed redirect URIs.',
        validate: { items: { url: true } },
      }),
      website: t.arg.string({
        description: 'URL to the website of the app. Used, amongst other things, to get the icon.',
        validate: { url: true },
      }),
      ownerGroupUid: t.arg.string({ description: 'The UID of  the group that made this app' }),
    },
    authScopes(_, { ownerGroupUid }, { user }) {
      return Boolean(user?.canEditGroups || userIsInBureauOf(user, ownerGroupUid));
    },
    async resolve(_, { ownerGroupUid, ...data }) {
      const app = await prisma.thirdPartyApp.create({
        data: {
          ...data,
          owner: { connect: { uid: ownerGroupUid } },
          secret: nanoid(30),
        },
      });
      return new ThirdPartyAppRegistrationResponse(removeIdPrefix(app.id), app.secret);
    },
  }),
);

builder.mutationField('authorize', (t) =>
  t.string({
    description:
      "Authorize a third-party client to access the user's data. Returns an access code. Use that code to get an access token with /token.",
    authScopes: { loggedIn: true },
    args: {
      clientId: t.arg.string(),
      redirectUri: t.arg.string({ validate: { url: true } }),
    },
    async resolve(_, { clientId, redirectUri }, { user }) {
      if (!user) throw new GraphQLError('Not logged in');
      const client = await prisma.thirdPartyApp.findUniqueOrThrow({
        where: { id: ensureHasIdPrefix(clientId, 'ThirdPartyApp') },
      });

      if (!client.active) throw new GraphQLError('This app has been deactivated');

      if (!client.allowedRedirectUris.includes(redirectUri))
        throw new GraphQLError('Invalid redirect URI');

      const { value } = await prisma.thirdPartyCredential.create({
        data: {
          clientId: client.id,
          value: generateThirdPartyToken(),
          type: ThirdPartyCredentialType.AuthorizationCode,
          // Keep the auth code for 7 days
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          ownerId: user.id,
        },
      });
      return value;
    },
  }),
);
