import { builder } from '#lib';

import { OAuth2ErrorCode } from '../index.js';
// TODO rename to oauth2-error

export class OAuth2Error extends Error {
  code: OAuth2ErrorCode;

  constructor(code: OAuth2ErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
builder.objectType(OAuth2Error, {
  name: 'OAuth2Error',
  fields: (t) => ({
    message: t.exposeString('message'),
    code: t.expose('code', { type: OAuth2ErrorCode }),
  }),
});
