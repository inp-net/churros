import { env } from '$env/dynamic/public';
import { AUTH_URL } from '$lib/env';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
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
  // Causes the API to return a token in the redirect URL instead of setting a cookie,
  // and also redirects to the churros.app URL scheme instead of the frontend web origin
  if (Capacitor.isNativePlatform()) url.searchParams.set('native', '1');

  return url;
}

export function oauthLogoutURL(): URL {
  return new URL(AUTH_URL + '/logout');
}

export async function authedVia(event: { cookies: Cookies }): Promise<'oauth2' | 'token' | null> {
  if (Capacitor.isNativePlatform()) {
    return Preferences.get({
      key: 'authed_via',
    }).then(({ value }) => {
      if (value === 'oauth2') return 'oauth2';
      if (value === 'token') return 'token';
      return null;
    });
  }
  if (event.cookies.get('authed_via') === 'oauth2') return 'oauth2';

  if (event.cookies.get('token')) return 'token';

  return null;
}
