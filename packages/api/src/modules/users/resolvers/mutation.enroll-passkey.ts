import { WEBAUTHN_RELYING_PARTY, builder, log, prisma, webauthnToDatabaseKeyId } from '#lib';
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
      authenticatorData: t.input.string({ required: false }),
      publicKeyAlgorithm: t.input.int(),
      publicKey: t.input.string(),
      authenticatorAttachment: t.input.string({ required: false }),
      type: t.input.string(),
      transports: t.input.stringList(),
    },
    async resolve(
      _,
      { input, input: { id, rawId, authenticatorAttachment, type, transports, ...response } },
      { user, token },
    ) {
      if (!user || !token) throw new GraphQLError('Utilisateur·ice non trouvé·e');
      await log('passkeys', 'enrolling', input, input.id, user);
      const challenge = await prisma.credential.findFirst({
        where: {
          userId: user.id,
          type: 'PasskeyEnrollmentChallenge',
          expiresAt: {
            gte: new Date(),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      if (!challenge) throw new GraphQLError('Aucun challenge trouvé');
      const verification = await verifyRegistrationResponse({
        response: {
          id,
          rawId,
          authenticatorAttachment: (authenticatorAttachment ?? undefined) as
            | AuthenticatorAttachment
            | undefined,
          type: type as PublicKeyCredentialType,
          response: {
            ...response,
            authenticatorData: response.authenticatorData ?? undefined,
          },
          clientExtensionResults: {},
        },
        expectedChallenge: challenge.value,
        expectedOrigin: process.env.FRONTEND_ORIGIN,
        expectedRPID: WEBAUTHN_RELYING_PARTY.id,
        requireUserVerification: true,
      });

      // Always delete the challenge to prevent replay attacks
      await prisma.credential.delete({
        where: {
          id: challenge.id,
        },
      });

      if (verification.registrationInfo) {
        const { credentialID, credentialDeviceType, counter, credentialPublicKey } =
          verification.registrationInfo;
        // userId is a global ID where the local part is the base64-encoded credentialID
        const credential = await prisma.credential.upsert({
          where: { userId: user.id, type: 'PublicKey', id },
          create: {
            id: webauthnToDatabaseKeyId(credentialID),
            userId: user.id,
            type: 'PublicKey',
            userAgent: credentialDeviceType,
            value: Buffer.from(credentialPublicKey).toString('base64'),
            transports: { set: transports },
            counter,
          },
          update: {
            userAgent: credentialDeviceType,
            value: Buffer.from(credentialPublicKey).toString('base64'),
            transports: { set: transports },
            counter,
          },
        });
        await log('passkeys', 'enrolled', credential, credential.id, user);
      }

      return verification.verified;
    },
  }),
);
