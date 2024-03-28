import {
  builder,
  databaseToWebauthnKeyId,
  log,
  prisma,
  WEBAUTHN_CHALLENGE_EXPIRATION_MINUTES,
  WEBAUTHN_RELYING_PARTY,
} from '#lib';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/types';
import { addMinutes } from 'date-fns';
import { GraphQLError } from 'graphql';
import { PasskeyAuthenticationOptionsType } from '../types/passkey-authentication-options.js';
import { userByEmail } from '../utils/find.js';

builder.mutationField('preparePasskeyLogin', (t) =>
  t.field({
    type: PasskeyAuthenticationOptionsType,
    description: `Démarrer une authentication par passkey`,
    args: {
      email: t.arg.id({
        description: "Email ou nom d'utlisateur·ice en tant que qui l'on souhaite s'authentifier",
      }),
    },
    async resolve(_, { email }) {
      const { user } = await userByEmail(email, {
        credentials: {
          where: {
            type: 'PublicKey',
          },
        },
      });

      if (!user) 
        throw new GraphQLError('Utilisateur·ice non trouvé·e');
      

      const options = await generateAuthenticationOptions({
        rpID: WEBAUTHN_RELYING_PARTY.id,
        userVerification: 'preferred',
        allowCredentials: user.credentials.map((passkey) => ({
          id: databaseToWebauthnKeyId(passkey.id),
          type: 'public-key',
          transports: passkey.transports as AuthenticatorTransportFuture[],
        })),
      });

      await prisma.credential.create({
        data: {
          type: 'PasskeyEnrollmentChallenge',
          userId: user.id,
          value: options.challenge,
          expiresAt: addMinutes(new Date(), WEBAUTHN_CHALLENGE_EXPIRATION_MINUTES),
        },
      });

      await log('passkeys', 'login/initiate', options, user.id);

      return options;
    },
  }),
);
