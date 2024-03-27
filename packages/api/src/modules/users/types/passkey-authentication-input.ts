import { builder } from '#lib';
/**
     * 
     * 
    clientDataJSON: Base64URLString;
    authenticatorData: Base64URLString;
    signature: Base64URLString;
    userHandle?: string;
     */

const PasskeyAuthenticationInputAssertionResponse = builder.inputType(
  'PasskeyAuthenticationInputAssertionResponse',
  {
    fields: (t) => ({
      clientDataJSON: t.string(),
      authenticatorData: t.string(),
      signature: t.string(),
      userHandle: t.string({ required: false }),
    }),
  },
);

/**
 * rk?: string;
 */

const PasskeyAuthenticationInputExtensionsCredProps = builder.inputType(
  'PasskeyAuthenticationInputExtensionsCredProps',
  {
    fields: (t) => ({
      rk: t.boolean({ required: false }),
    }),
  },
);

/**
 * 
 *     appid?: boolean;
    credProps?: CredentialPropertiesOutput;
    hmacCreateSecret?: boolean;
 */

const PasskeyAuthenticationInputExtensions = builder.inputType(
  'PasskeyAuthenticationInputExtensions',
  {
    fields: (t) => ({
      appid: t.boolean({ required: false }),
      credProps: t.field({
        type: PasskeyAuthenticationInputExtensionsCredProps,
        required: false,
      }),
      hmacCreateSecret: t.boolean({ required: false }),
    }),
  },
);

/**
 * 
    id: Base64URLString;
    rawId: Base64URLString;
    response: AuthenticatorAssertionResponseJSON;
    authenticatorAttachment?: AuthenticatorAttachment;
    clientExtensionResults: AuthenticationExtensionsClientOutputs;
    type: PublicKeyCredentialType;
 */

export const PasskeyAuthenticationInput = builder.inputType('PasskeyAuthenticationInput', {
  fields: (t) => ({
    id: t.string(),
    rawId: t.string(),
    response: t.field({
      type: PasskeyAuthenticationInputAssertionResponse,
    }),
    authenticatorAttachment: t.string({ required: false }),
    clientExtensionResults: t.field({
      type: PasskeyAuthenticationInputExtensions,
    }),
    type: t.string(),
  }),
});
