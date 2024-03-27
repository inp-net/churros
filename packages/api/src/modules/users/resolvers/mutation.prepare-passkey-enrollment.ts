import {
  builder,
  databaseToWebauthnKeyId,
  log,
  prisma,
  WEBAUTHN_CHALLENGE_EXPIRATION_MINUTES,
  WEBAUTHN_RELYING_PARTY,
} from '#lib';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { addMinutes } from 'date-fns';
import { GraphQLError } from 'graphql';
import { PasskeyRegistrationOptionsType } from '../types/passkey-registration-options.js';
import { fullName } from '../utils/names.js';

builder.mutationField('preparePasskeyEnrollment', (t) =>
  t.field({
    type: PasskeyRegistrationOptionsType,
    description: 'Récupérer les options pour enroller une passkey',
    authScopes: { loggedIn: true },
    async resolve(_, __, { user }) {
      if (!user) throw new GraphQLError('Utilisateur·ice non trouvé·e');

      const existingPasskeys = await prisma.credential.findMany({
        where: {
          userId: user.id,
          type: 'PublicKey',
        },
      });

      const options = await generateRegistrationOptions({
        rpID: WEBAUTHN_RELYING_PARTY.id,
        rpName: WEBAUTHN_RELYING_PARTY.name,
        userID: user.id,
        userName: fullName(user),
        // TODO change
        timeout: undefined,
        attestationType: 'none',
        excludeCredentials: existingPasskeys.map((passkey) => ({
          id: databaseToWebauthnKeyId(passkey.id),
          type: 'public-key',
        })),
        authenticatorSelection: {
          residentKey: 'required',
          userVerification: 'required',
        },
      });

      await prisma.credential.create({
        data: {
          type: 'PasskeyEnrollmentChallenge',
          userId: user.id,
          value: options.challenge,
          expiresAt: addMinutes(new Date(), WEBAUTHN_CHALLENGE_EXPIRATION_MINUTES),
        },
      });

      await log('passkeys', 'enroll/initiate', options, undefined, user);

      return options;
    },
  }),
);
