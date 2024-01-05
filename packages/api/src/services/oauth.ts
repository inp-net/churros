import { builder, ensureHasIdPrefix, prisma, removeIdPrefix } from '#lib';
import { ThirdPartyCredentialType } from '@prisma/client';
import { hash } from 'argon2';
import { GraphQLError } from 'graphql';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { generateThirdPartyToken } from '../auth.js';
import type { Context } from '../context.js';
import { userIsInBureauOf } from '../objects/groups.js';
import { log } from '../objects/logs.js';

export const CLIENT_SECRET_LENGTH = 30;

export async function canEditApp(
  _: unknown,
  { id }: { id: string },
  { user }: { user?: Context['user'] | undefined },
) {
  if (!user) return false;
  if (user.admin) return true;

  return Boolean(
    await prisma.thirdPartyApp.count({
      where: {
        id,
        owner: {
          members: {
            some: {
              member: { id: user.id },
              OR: [
                {
                  president: true,
                },
                {
                  vicePresident: true,
                },
                {
                  secretary: true,
                },
                {
                  treasurer: true,
                },
              ],
            },
          },
        },
      },
    }),
  );
}

export const ThirdPartyApp = builder.prismaObject('ThirdPartyApp', {
  description: 'A third-party OAuth2 client',
  fields: (t) => ({
    id: t.exposeID('id'),
    clientId: t.string({
      resolve({ id }) {
        return removeIdPrefix(id);
      },
    }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: true }),
    name: t.exposeString('name'),
    secretLength: t.int({
      resolve() {
        return CLIENT_SECRET_LENGTH;
      },
    }),
    description: t.exposeString('description'),
    website: t.exposeString('website'),
    active: t.exposeBoolean('active'),
    faviconUrl: t.string({
      async resolve({ website, id }) {
        if (!website) return '';

        function bustCache(url: string): string {
          const result = new URL(url);
          result.searchParams.set('client', removeIdPrefix(id));
          return result.toString();
        }

        const app = await prisma.thirdPartyApp.findUniqueOrThrow({ where: { id } });
        if (app.faviconUrl) return bustCache(app.faviconUrl);
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
        return bustCache(favicon.url);
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
        validate: { schema: z.string().url().or(z.literal('')) },
      }),
      ownerGroupUid: t.arg.string({ description: 'The UID of  the group that made this app' }),
    },
    authScopes(_, { ownerGroupUid }, { user }) {
      return Boolean(user?.canEditGroups || userIsInBureauOf(user, ownerGroupUid));
    },
    async resolve(_, { ownerGroupUid, ...data }) {
      const secretClear = nanoid(CLIENT_SECRET_LENGTH);
      const app = await prisma.thirdPartyApp.create({
        data: {
          ...data,
          owner: { connect: { uid: ownerGroupUid } },
          secret: await hash(secretClear),
        },
      });
      return new ThirdPartyAppRegistrationResponse(removeIdPrefix(app.id), secretClear);
    },
  }),
);

builder.mutationField('rotateAppSecret', (t) =>
  t.string({
    description: "Rotate a third-party app's secret",
    args: {
      id: t.arg.id({
        description: "The app's ID",
      }),
    },
    authScopes: canEditApp,
    async resolve(_, { id }, { user }) {
      const secretClear = nanoid(CLIENT_SECRET_LENGTH);
      await prisma.thirdPartyApp.update({
        where: { id },
        data: { secret: await hash(secretClear) },
      });
      await log('third-party apps', 'rotate secret', {}, id, user);
      return secretClear;
    },
  }),
);

builder.mutationField('activateApp', (t) =>
  t.boolean({
    description: 'Activate a third-party app. Only admins can do this.',
    args: {
      id: t.arg.id({
        description: "The app's ID",
      }),
    },
    authScopes: { admin: true },
    async resolve(_, { id }, { user }) {
      await prisma.thirdPartyApp.update({
        where: { id },
        data: { active: true },
      });
      await log('third-party apps', 'activate', {}, id, user);
      return true;
    },
  }),
);

builder.mutationField('deactivateApp', (t) =>
  t.boolean({
    description: 'Deactivate a third-party app. Only admins can do this.',
    args: {
      id: t.arg.id({
        description: "The app's ID",
      }),
    },
    authScopes: { admin: true },
    async resolve(_, { id }, { user }) {
      await prisma.thirdPartyApp.update({
        where: { id },
        data: { active: false },
      });
      await log('third-party apps', 'deactivate', {}, id, user);
      return true;
    },
  }),
);

builder.mutationField('editApp', (t) =>
  t.prismaField({
    description: "Update a third-party app's details",
    type: 'ThirdPartyApp',
    args: {
      id: t.arg.id({
        description: "The app's ID",
      }),
      website: t.arg.string({ required: false }),
      name: t.arg.string({ required: false }),
      description: t.arg.string({ required: false }),
      allowedRedirectUris: t.arg.stringList({
        required: false,
        validate: { items: { url: true } },
      }),
      ownerGroupUid: t.arg.string({ required: false }),
    },
    authScopes: canEditApp,
    async resolve(query, _, { id, ...data }, { user }) {
      await log('third-party apps', 'edit', data, id, user);
      const { allowedRedirectUris: oldAllowedRedirectUris } =
        await prisma.thirdPartyApp.findUniqueOrThrow({ where: { id } });

      const allowedURIsWillChange = !(
        oldAllowedRedirectUris.every((uri) => (data.allowedRedirectUris ?? []).includes(uri)) &&
        oldAllowedRedirectUris.length !== (data.allowedRedirectUris ?? []).length
      );

      return prisma.thirdPartyApp.update({
        ...query,
        where: { id },
        data: {
          allowedRedirectUris: data.allowedRedirectUris ?? undefined,
          description: data.description ?? undefined,
          name: data.name ?? undefined,
          website: data.website ?? undefined,
          owner: data.ownerGroupUid ? { connect: { uid: data.ownerGroupUid } } : undefined,
          active: allowedURIsWillChange ? false : undefined,
        },
      });
    },
  }),
);

// All OAuth2 errors from RFC 6749

enum OAuth2ErrorCode {
  InvalidRequest = 'invalid_request',
  UnauthorizedClient = 'unauthorized_client',
  AccessDenied = 'access_denied',
  UnsupportedResponseType = 'unsupported_response_type',
  InvalidScope = 'invalid_scope',
  ServerError = 'server_error',
  TemporarilyUnavailable = 'temporarily_unavailable',
}

class OAuth2Error extends Error {
  code: OAuth2ErrorCode;

  constructor(code: OAuth2ErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

builder.enumType(OAuth2ErrorCode, {
  name: 'OAuth2ErrorCode',
  description: 'OAuth2 error codes, see RFC 6749 § 4.1.2.1',
});

builder.objectType(OAuth2Error, {
  name: 'OAuth2Error',
  fields: (t) => ({
    message: t.exposeString('message'),
    code: t.expose('code', { type: OAuth2ErrorCode }),
  }),
});

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

      if (!client.active) {
        throw new OAuth2Error(
          OAuth2ErrorCode.UnauthorizedClient,
          `This app is not active yet. Please try again later. Contact ${process.env.PUBLIC_CONTACT_EMAIL} if your app takes more than a week to get activated.`,
        );
      }

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

builder.queryField('myApps', (t) =>
  t.prismaField({
    type: ['ThirdPartyApp'],
    authScopes: { loggedIn: true },
    async resolve(query, _, __, { user }) {
      if (!user) throw new GraphQLError('Not logged in');
      const boardIn = await prisma.group.findMany({
        where: {
          members: {
            some: {
              member: { id: user.id },
              OR: [
                {
                  president: true,
                },
                {
                  vicePresident: true,
                },
                {
                  secretary: true,
                },
                {
                  treasurer: true,
                },
              ],
            },
          },
        },
      });
      return prisma.thirdPartyApp.findMany({
        ...query,
        where: {
          ownerId: {
            in: boardIn.map((g) => g.id),
          },
        },
      });
    },
  }),
);
builder.queryField('allApps', (t) =>
  t.prismaField({
    description: 'Get all OAuth2 clients. Only admins can do this.',
    type: ['ThirdPartyApp'],
    authScopes: { admin: true },
    resolve: (query) => prisma.thirdPartyApp.findMany(query),
  }),
);
