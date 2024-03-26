import { builder } from '#lib';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { GraphQLError } from 'graphql';
import { PasskeyRegistrationOptionsType } from '../types/passkey-registration-options.js';
import { fullName } from '../utils/names.js';

builder.queryField('passkeyRegistrationOptions', (t) =>
  t.field({
    type: PasskeyRegistrationOptionsType,
    description: 'Récupérer les options pour enroller une passkey',
    authScopes: { loggedIn: true },
    async resolve(_, __, { user }) {
      if (!user) throw new GraphQLError('Utilisateur·ice non trouvé·e');

      return generateRegistrationOptions({
        rpID: process.env.FRONTEND_ORIGIN,
        rpName: 'Churros',
        userID: user.id,
        userName: fullName(user),
        timeout: undefined,
        attestationType: 'none',
        // TODO
        excludeCredentials: [],
        authenticatorSelection: {
          residentKey: 'required',
          userVerification: 'preferred',
        }
      });
    },
  }),
);
