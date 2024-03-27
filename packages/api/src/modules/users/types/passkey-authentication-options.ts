import { builder } from '#lib';
import { type PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types';
import {
  PasskeyExtensions,
  PublicKeyCredentialDescriptor,
} from './passkey-registration-options.js';

export const PasskeyAuthenticationOptionsType = builder
  .objectRef<PublicKeyCredentialRequestOptionsJSON>('PasskeyAuthenticationOptions')
  .implement({
    fields: (t) => ({
      challenge: t.exposeString('challenge'),
      timeout: t.exposeInt('timeout', { nullable: true }),
      rpId: t.exposeString('rpId', { nullable: true }),
      allowCredentials: t.expose('allowCredentials', {
        type: [PublicKeyCredentialDescriptor],
        nullable: true,
      }),
      userVerification: t.exposeString('userVerification', { nullable: true }),
      extensions: t.expose('extensions', {
        type: PasskeyExtensions,
        nullable: true,
      }),
    }),
  });
