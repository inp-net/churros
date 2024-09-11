import { env } from '$env/dynamic/public';
import { AUTH_URL } from '$lib/env';
import type { Cookies } from '@sveltejs/kit';

export function oauthEnabled(): boolean {
  return env.PUBLIC_OAUTH_ENABLED.trim() === '1';
}

export function oauthLoginBypassed(event: { url: URL }): boolean {
  return (
    event.url.searchParams.has('migrate') || event.url.searchParams.get('bypass_oauth') === '1'
  );
}

export function oauthInitiateLoginURL(event: { url: URL }): URL {
  const url = new URL(AUTH_URL + '/oauth2');
  url.searchParams.set('from', event.url.searchParams.get('from') ?? '/');
  return url;
}

export function oauthLogoutURL(): URL {
  return new URL(AUTH_URL + '/logout');
}

export function authedVia(event: { cookies: Cookies }): 'oauth2' | 'token' | null {
  if (event.cookies.get('authed_via') === 'oauth2') return 'oauth2';

  if (event.cookies.get('token')) return 'token';

  return null;
}
