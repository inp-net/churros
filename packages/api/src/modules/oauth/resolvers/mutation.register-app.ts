import { builder, prisma, removeIdPrefix } from '#lib';

import { userIsOnBoardOf } from '#permissions';
import { hash } from 'argon2';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { CLIENT_SECRET_LENGTH } from '../index.js';
// TODO rename register-third-party-app

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
      return Boolean(user?.canEditGroups || userIsOnBoardOf(user, ownerGroupUid));
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
      return {
        client_id: removeIdPrefix(app.id),
        client_secret: secretClear,
      };
    },
  }),
);

type ThirdPartyAppRegistrationResponse = {
  client_id: string;
  client_secret: string;
};

export const ThirdPartyAppRegistrationResponseType = builder
  .objectRef<ThirdPartyAppRegistrationResponse>('ThirdPartyAppRegistrationResponse')
  .implement({
    fields: (t) => ({
      client_id: t.exposeString('client_id'),
      client_secret: t.exposeString('client_secret'),
    }),
  });
