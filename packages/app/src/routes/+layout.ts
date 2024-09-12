import { load_RootLayout } from '$houdini';
import { App } from '@capacitor/app';
import { setDefaultOptions } from 'date-fns';
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
  return await load_RootLayout({ event });
}
