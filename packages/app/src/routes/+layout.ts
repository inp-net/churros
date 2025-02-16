import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { env } from '$env/dynamic/public';
import { graphql, load_RootLayout } from '$houdini';
import { notificationClickRoute } from '$lib/notifications.js';
import { editingTheme } from '$lib/theme';
import { App } from '@capacitor/app';
import { Capacitor, CapacitorCookies } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { PushNotifications } from '@capacitor/push-notifications';
import { AppShortcuts } from '@capawesome/capacitor-app-shortcuts';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import * as Notella from '@inp-net/notella';
import * as Sentry from '@sentry/sveltekit';
import { addYears, setDefaultOptions } from 'date-fns';
import { fr } from 'date-fns/locale';
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

  App.addListener('appUrlOpen', (event) => {
    const url = new URL(event.url);
    goto(event.url.replace(url.origin, ''));
  });

  PushNotifications.addListener('pushNotificationActionPerformed', async (action) => {
    console.log(`Received push notification action: ${action}`);
    const message = JSON.parse(action.notification.data.original) as Notella.Message;
    const path = await notificationClickRoute(message);
    if (path) await goto(path);
  });

  await CapacitorUpdater.notifyAppReady();

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

  AppShortcuts.addListener('click', async ({ shortcutId }) => {
    await graphql(`
      query BookmarkURLByPath {
        me {
          bookmarks {
            path
            url
          }
        }
      }
    `)
      .fetch({ event })
      .then((result) => result.data?.me?.bookmarks.find(({ path }) => path === shortcutId)?.url)
      .then((url) => {
        if (!url) {
          goto(shortcutId);
          return;
        }

        const { pathname, origin } = new URL(url);
        if (origin === env.PUBLIC_FRONTEND_ORIGIN_ANDROID) goto(pathname);
        else globalThis.location.href = url.toString();
      });
  });

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
