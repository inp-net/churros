import { load_RootLayout } from '$houdini';
import { App } from '@capacitor/app';
import { Capacitor, CapacitorCookies } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { addYears, setDefaultOptions } from 'date-fns';
import fr from 'date-fns/locale/fr/index.js';

export const ssr = false;

export const trailingSlash = 'always';

export async function load(event) {
  setDefaultOptions({
    weekStartsOn: 1,
    locale: fr,
  });
  App.addListener('backButton', (event) => {
    // TODO close open drawer when there's one, instead of going back in history
    if (event.canGoBack) window.history.back();
    else App.exitApp();
  });
  if (Capacitor.isNativePlatform()) {
    const token = await Preferences.get({ key: 'token' }).then(({ value }) => value ?? '');
    console.log(JSON.stringify({ token_set_on_root_layout: token }));
    // Expose token to cookies so that houdini client can use it (its fetchParams function is synchronous so there's no way to call Preferences.get there)
    await CapacitorCookies.setCookie({
      key: 'token',
      value: token,
      // Token will definitely be invalid before that date, but the app should handle invalid tokens anyways
      expires: addYears(new Date(), 1).toISOString(),
      path: '/',
    });
  }
  return await load_RootLayout({ event });
}
