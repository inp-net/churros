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
import { PasskeyAuthenticationOptionsType } from '../types/passkey-authentication-options.js';

builder.mutationField('preparePasskeyLogin', (t) =>
  t.field({
    type: PasskeyAuthenticationOptionsType,
    description: `Démarrer une authentication par passkey`,
    args: {
      userId: t.arg.id({
        description: "L'identifiant de l'utilisateur·ice en tant que qui l'on veut s'authentifier",
      }),
    },
    async resolve(_, { userId }) {
      const passkeys = await prisma.credential.findMany({
        where: { userId, type: 'PublicKey' },
      });

      const options = await generateAuthenticationOptions({
        rpID: WEBAUTHN_RELYING_PARTY.id,
        userVerification: 'preferred',
        allowCredentials: passkeys.map((passkey) => ({
          id: databaseToWebauthnKeyId(passkey.id),
          type: 'public-key',
          transports: passkey.transports as AuthenticatorTransportFuture[],
        })),
      });

      await prisma.credential.create({
        data: {
          type: 'PasskeyEnrollmentChallenge',
          userId,
          value: options.challenge,
          expiresAt: addMinutes(new Date(), WEBAUTHN_CHALLENGE_EXPIRATION_MINUTES),
        },
      });

      await log('passkeys', 'login/initiate', options, userId);

      return options;
    },
  }),
);
