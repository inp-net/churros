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

export const PublicKeyCredentialDescriptor = builder
  .objectRef<PublicKeyCredentialDescriptorJSON>('PasskeyPublicKeyCredentials')
  .implement({
    fields: (t) => ({
      id: t.exposeString('id'),
      type: t.exposeString('type'),
      transports: t.exposeStringList('transports', { nullable: true }),
    }),
  });

export const PasskeyRegistrationOptionsType = builder
  .objectRef<PublicKeyCredentialCreationOptionsJSON>('PasskeyRegistrationOptions')
  .implement({
    fields: (t) => ({
      rp: t.expose('rp', {
        type: PasskeyRelyingParty,
      }),
      user: t.field({
        type: UserType,
        resolve: ({}, _, { user }) => {
          if (!user) throw new GraphQLError('No user is logged-in');
          return user;
        },
      }),
      challenge: t.exposeString('challenge'),
      pubKeyCredParams: t.expose('pubKeyCredParams', {
        type: [PasskeyPublicKeyCredentialsParams],
      }),
      timeout: t.exposeInt('timeout', { nullable: true }),
      excludeCredentials: t.expose('excludeCredentials', {
        type: [PublicKeyCredentialDescriptor],
        nullable: true,
      }),
      authenticatorSelection: t.expose('authenticatorSelection', {
        type: PasskeyAuthenticatorSelection,
        nullable: true,
      }),
      attestation: t.exposeString('attestation', { nullable: true }),
      extensions: t.expose('extensions', {
        type: PasskeyExtensions,
        nullable: true,
      }),
    }),
  });
