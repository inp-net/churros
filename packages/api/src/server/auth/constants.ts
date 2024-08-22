export const AUTHED_VIA_COOKIE_NAME = 'authed_via' as const;

/** Marker cookie with name AUTHED_VIA_COOKIE_NAME that sets a JS-accessible cookie (with httpOnly and secure to false) which allows client to know if they were authenticated through oauth2 (or potentially sth else in the future) as opposed to a local token authentication */
export enum AuthedViaCookie {
  OAUTH2 = 'oauth2',
}
