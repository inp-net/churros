import { goto } from '$app/navigation';
import { oauthEnabled, oauthInitiateLoginURL, oauthLoginBypassed } from '$lib/oauth';
import { Capacitor, CapacitorCookies } from '@capacitor/core';
import { InAppBrowser } from '@capgo/inappbrowser';
import { redirect } from '@sveltejs/kit';
import { addYears } from 'date-fns';

export async function load(event) {
  if (oauthEnabled() && !oauthLoginBypassed(event)) {
    if (Capacitor.isNativePlatform()) {
      await InAppBrowser.addListener('urlChangeEvent', async (event) => {
        const url = new URL(event.url);
        if (url.protocol === 'app.churros:') {
          await CapacitorCookies.setCookie({
            key: 'authed_via',
            value: 'oauth2',
            expires: addYears(new Date(), 1).toISOString(),
            path: '/',
          });
          await CapacitorCookies.setCookie({
            key: 'token',
            value: url.searchParams.get('token') ?? '',
            expires: addYears(new Date(), 1).toISOString(),
            path: '/',
          });
          await InAppBrowser.close();
          await goto('/login/done');
        }
      });
      await InAppBrowser.openWebView({ url: oauthInitiateLoginURL(event).toString() });
    } else {
      redirect(307, oauthInitiateLoginURL(event));
    }
  }
}
