import { builder } from '#lib';

// TODO rename to oauth2-error-code

// All OAuth2 errors from RFC 6749

export enum OAuth2ErrorCode {
  invalid_request,
  unauthorized_client,
  access_denied,
  unsupported_response_type,
  invalid_scope,
  server_error,
  temporarily_unavailable,
}

builder.enumType(OAuth2ErrorCode, {
  name: 'OAuth2ErrorCode',
  description: 'OAuth2 error codes, see RFC 6749 § 4.1.2.1',
});
