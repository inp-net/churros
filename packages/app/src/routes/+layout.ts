import { load_RootLayout } from '$houdini';
import { setDefaultOptions } from 'date-fns';
import fr from 'date-fns/locale/fr/index.js';

export const ssr = true;

export const trailingSlash = 'always';

export async function load(event) {
  setDefaultOptions({
    weekStartsOn: 1,
    locale: fr,
  });
  return await load_RootLayout({ event });
}
