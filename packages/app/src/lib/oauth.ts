import { goto } from '$app/navigation';
import { env } from '$env/dynamic/public';
import { getAuthUrl } from '$lib/env';
import { getServerManifest } from '$lib/servmanifest';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { InAppBrowser } from '@capgo/inappbrowser';
import { parse } from 'cookie';

export function oauthEnabled(): boolean {
  const manifest = getServerManifest();
  return manifest.oauth.enabled && manifest.urls.api === env.PUBLIC_API_URL;
}

export function oauthLoginBypassed(event: { url: URL }): boolean {
  return !event.url.searchParams.has('force_oauth');
}

export async function oauthInitiateLogin(event: { url: URL }) {
  if (Capacitor.isNativePlatform()) 
    await oauthInitiateLoginNative(event);
   else 
    globalThis.location.href = oauthInitiateLoginURL(event).toString();
  
}

export async function oauthInitiateLoginNative(event: { url: URL }) {
  await InAppBrowser.addListener('urlChangeEvent', async (event) => {
    const url = new URL(event.url);
    if (url.protocol === 'app.churros:') {
      await Preferences.set({
        key: 'authed_via',
        value: 'oauth2',
      });
      const token = url.searchParams.get('token');
      if (token) {
        await Preferences.set({
          key: 'token',
          value: token,
        });
      } else {
        await Preferences.remove({ key: 'token' });
        await Preferences.remove({ key: 'authed_via' });
      }
      await InAppBrowser.close();
      await goto('/login/done');
    }
  });
  await InAppBrowser.openWebView({ url: oauthInitiateLoginURL(event).toString() });
}
export function oauthInitiateLoginURL(event: { url: URL }): URL {
  const url = new URL(getAuthUrl() + '/oauth2');

  url.searchParams.set('from', event.url.searchParams.get('from') ?? '/');
  // Causes the API to return a token in the redirect URL instead of setting a cookie,
  // and also redirects to the churros.app URL scheme instead of the frontend web origin
  if (Capacitor.isNativePlatform()) url.searchParams.set('native', '1');

  return url;
}

export function oauthLogoutURL(): URL {
  return new URL(getAuthUrl() + '/logout');
}

export async function authedVia(cookies: Document['cookie']): Promise<'oauth2' | 'token' | null> {
  if (Capacitor.isNativePlatform()) {
    return Preferences.get({
      key: 'authed_via',
    }).then(({ value }) => {
      if (value === 'oauth2') return 'oauth2';
      if (value === 'token') return 'token';
      return null;
    });
  }
  if (parse(cookies).authed_via === 'oauth2') return 'oauth2';
  if ('token' in parse(cookies)) return 'token';

  return null;
}
