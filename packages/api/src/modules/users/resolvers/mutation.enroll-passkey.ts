import { builder, prisma, TYPENAMES_TO_ID_PREFIXES } from '#lib';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { GraphQLError } from 'graphql';

builder.mutationField('enrollPasskey', (t) =>
  t.fieldWithInput({
    type: 'Boolean',
    description: 'Vérifier un enrollement de passkey',
    authScopes: { loggedIn: true },
    input: {
      id: t.input.string(),
      rawId: t.input.string(),
      clientDataJSON: t.input.string(),
      attestationObject: t.input.string(),
      authenticatorData: t.input.string(),
      publicKeyAlgorithm: t.input.int(),
      publicKey: t.input.string(),
      authenticatorAttachment: t.input.string({ required: false }),
      type: t.input.string(),
    },
    async resolve(
      _,
      { input: { id, rawId, authenticatorAttachment, type, ...response } },
      { user, token },
    ) {
      if (!user || !token) throw new GraphQLError('Utilisateur·ice non trouvé·e');
      const verification = await verifyRegistrationResponse({
        response: {
          id,
          rawId,
          authenticatorAttachment: (authenticatorAttachment ?? undefined) as
            | AuthenticatorAttachment
            | undefined,
          type: type as PublicKeyCredentialType,
          response,
          clientExtensionResults: {},
        },
        // TODO don't use the token, use  ashort-lived PasskeyEnrollmentChallenge-type credential created by doing startPasskeyEnrollment
        expectedChallenge: token,
        expectedOrigin: process.env.FRONTEND_ORIGIN,
        expectedRPID: process.env.FRONTEND_ORIGIN,
        requireUserVerification: true,
      });

      if (verification.registrationInfo) {
        const { credentialID, credentialDeviceType, counter, credentialPublicKey } =
          verification.registrationInfo;
        // userId is a global ID where the local part is the base64-encoded credentialID
        const id = `${TYPENAMES_TO_ID_PREFIXES.Credential}:${Buffer.from(credentialID).toString(
          'base64',
        )}`;
        await prisma.credential.upsert({
          where: { userId: user.id, type: 'PublicKey', id },
          create: {
            id,
            userId: user.id,
            type: 'PublicKey',
            userAgent: credentialDeviceType,
            value: Buffer.from(credentialPublicKey).toString('base64'),
            counter,
          },
          update: {
            userAgent: credentialDeviceType,
            value: Buffer.from(credentialPublicKey).toString('base64'),
            counter,
          },
        });
      }

      return verification.verified;
    },
  }),
);
