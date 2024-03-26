import { builder } from '#lib';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialDescriptorJSON,
} from '@simplewebauthn/types';
import { GraphQLError } from 'graphql';
import { UserType } from './user.js';
// export type PasskeyRegistrationOptions = Awaited<ReturnType<typeof generateRegistrationOptions>>

const PasskeyPublicKeyCredentialsParams = builder
  .objectRef<PublicKeyCredentialParameters>('PasskeyPublicKeyCredentialParameters')
  .implement({
    fields: (t) => ({
      type: t.exposeString('type'),
      alg: t.exposeInt('alg'),
    }),
  });

const PasskeyRelyingParty = builder
  .objectRef<PublicKeyCredentialRpEntity>('PasskeyRelyingParty')
  .implement({
    fields: (t) => ({
      id: t.exposeString('id', {
        nullable: true,
      }),
      name: t.exposeString('name'),
    }),
  });

const PasskeyAuthenticatorSelection = builder
  .objectRef<AuthenticatorSelectionCriteria>('PasskeyAuthenticatorSelection')
  .implement({
    fields: (t) => ({
      authenticatorAttachment: t.exposeString('authenticatorAttachment', { nullable: true }),
      requireResidentKey: t.exposeBoolean('requireResidentKey', { nullable: true }),
      residentKey: t.exposeString('residentKey', { nullable: true }),
      userVerification: t.exposeString('userVerification', { nullable: true }),
    }),
  });

export const PasskeyExtensions = builder
  .objectRef<AuthenticationExtensionsClientInputs>('PasskeyExtensions')
  .implement({
    fields: (t) => ({
      appid: t.exposeString('appid', {
        nullable: true,
      }),
      credProps: t.exposeBoolean('credProps', {
        nullable: true,
      }),
      hmacCreateSecret: t.exposeBoolean('hmacCreateSecret', {
        nullable: true,
      }),
    }),
  });

export const PasskeyExcludeCredentials = builder
  .objectRef<PublicKeyCredentialDescriptorJSON>('PasskeyPublicKeyCredentials')
  .implement({
    fields: (t) => ({
      id: t.exposeString('id', { nullable: true }),
      type: t.exposeString('type'),
      transports: t.exposeStringList('transports', { nullable: true }),
    }),
  });

export const PasskeyRegistrationOptionsType = builder
  .objectRef<PublicKeyCredentialCreationOptionsJSON>('PasskeyRegistrationOptions')
  .implement({
    fields: (t) => ({
      rp: t.field({
        type: PasskeyRelyingParty,
        resolve: ({ rp }) => rp,
      }),
      user: t.field({
        type: UserType,
        resolve: ({}, _, { user }) => {
          if (!user) throw new GraphQLError('No user is logged-in');
          return user;
        },
      }),
      challenge: t.exposeString('challenge'),
      pubKeyCredParams: t.field({
        type: [PasskeyPublicKeyCredentialsParams],
        resolve: ({ pubKeyCredParams }) => pubKeyCredParams,
      }),
      timeout: t.exposeInt('timeout', { nullable: true }),
      excludeCredentials: t.field({
        type: [PasskeyExcludeCredentials],
        nullable: true,
        resolve: ({ excludeCredentials }) => excludeCredentials,
      }),
      authenticatorSelection: t.field({
        type: PasskeyAuthenticatorSelection,
        nullable: true,
        resolve: ({ authenticatorSelection }) => authenticatorSelection,
      }),
      attestation: t.exposeString('attestation', { nullable: true }),
      extensions: t.field({
        type: PasskeyExtensions,
        nullable: true,
        resolve: ({ extensions }) => extensions,
      }),
    }),
  });
