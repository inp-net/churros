import { goto } from '$app/navigation';
import { oauthEnabled, oauthInitiateLoginURL, oauthLoginBypassed } from '$lib/oauth';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { InAppBrowser } from '@capgo/inappbrowser';
import { redirect } from '@sveltejs/kit';

export async function load(event) {
  if (oauthEnabled() && !oauthLoginBypassed(event)) {
    if (Capacitor.isNativePlatform()) {
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
    } else {
      redirect(307, oauthInitiateLoginURL(event));
    }
  }
}
