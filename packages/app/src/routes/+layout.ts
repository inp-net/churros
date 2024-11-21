import { browser } from '$app/environment';
import { load_RootLayout } from '$houdini';
import { editingTheme } from '$lib/theme';
import { setDefaultOptions } from 'date-fns';
import fr from 'date-fns/locale/fr/index.js';
import { get } from 'svelte/store';

export const ssr = false;

export const trailingSlash = 'always';

export async function load(event) {
  setDefaultOptions({
    weekStartsOn: 1,
    locale: fr,
  });
  return await load_RootLayout({
    event,
    variables: {
      editingThemeId: browser ? (get(editingTheme)?.id ?? 'none') : 'none',
      editingTheme: browser ? Boolean(get(editingTheme)) : false,
    },
  });
}
