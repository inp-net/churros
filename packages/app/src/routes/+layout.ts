import { dev } from '$app/environment';
import { load_RootLayout } from '$houdini';
import { setDefaultOptions } from 'date-fns';
import fr from 'date-fns/locale/fr/index.js';

// FIXME: Makes vite hang on dev because of too many open files. Removing $lib/components/index.ts might fix this
export const ssr = !dev;

export const trailingSlash = 'always';

export async function load(event) {
  setDefaultOptions({
    weekStartsOn: 1,
    locale: fr,
  });
  return await load_RootLayout({ event });
}
