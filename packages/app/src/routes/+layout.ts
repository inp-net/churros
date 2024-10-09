import { browser } from '$app/environment';
import { load_RootLayout } from '$houdini';
import { editingTheme } from '$lib/theme';
import { setDefaultOptions } from 'date-fns';
import fr from 'date-fns/locale/fr/index.js';
import { get } from 'svelte/store';
import type { RootLayoutVariables } from './$houdini';

export const ssr = false;

export const trailingSlash = 'always';

export async function load(event) {
  setDefaultOptions({
    weekStartsOn: 1,
    locale: fr,
  });
  return await load_RootLayout({ event });
}

export const _RootLayoutVariables: RootLayoutVariables = async () => ({
  editingTheme: browser ? (get(editingTheme)?.id ?? '') : '',
});
