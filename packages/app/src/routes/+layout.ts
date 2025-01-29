import { browser } from '$app/environment';
import { graphql, load_RootLayout } from '$houdini';
import { editingTheme } from '$lib/theme';
import { App } from '@capacitor/app';
import { Capacitor, CapacitorCookies } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import * as Sentry from '@sentry/sveltekit';
import { addYears, setDefaultOptions } from 'date-fns';
import fr from 'date-fns/locale/fr/index.js';
import { get } from 'svelte/store';

export const ssr = false;

export const trailingSlash = 'always';

export async function load(event) {
  setDefaultOptions({
    weekStartsOn: 1,
    locale: fr,
  });

  App.addListener('backButton', (event) => {
    // TODO close open drawer when there's one, instead of going back in history
    if (event.canGoBack) globalThis.history.back();
    else App.exitApp();
  });

  if (Capacitor.isNativePlatform()) {
    // Expose token to cookies so that houdini client can use it (its fetchParams function is synchronous so there's no way to call Preferences.get there)
    await CapacitorCookies.setCookie({
      key: 'token',
      value: await Preferences.get({ key: 'token' }).then(({ value }) => value ?? ''),
      // Token will definitely be invalid before that date, but the app should handle invalid tokens anyways
      expires: addYears(new Date(), 1).toISOString(),
      path: '/',
    });
  }

  const SentryUser = await graphql(`
    query RootLayoutSentryUser {
      me {
        ...SentryUser @mask_disable
      }
    }
  `)
    .fetch({ event })
    .then((result) => result.data?.me)
    .catch(() => null);

  if (SentryUser) Sentry.setUser({ id: SentryUser.uid });

  return await load_RootLayout({
    event,
    variables: {
      editingThemeId: browser ? (get(editingTheme)?.id ?? 'none') : 'none',
      editingTheme: browser ? Boolean(get(editingTheme)) : false,
    },
  });
}
