import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const DARK_THEMES = new Set(['dark', 'hacker', 'noel', 'gd7t']);

/** Current theme, as a writable store. */
export const theme = writable('system', (set) => {
  // It's not possible to load the theme on the server
  if (!browser) return;

  // Force Noël theme if not re-set to sth else by the user
  if (localStorage.getItem('theme') === 'noel') {
    set('system');
  } else {
    // Try to load the theme from sessionStorage or fallback to a media query
    set(localStorage.getItem('theme') ?? 'system');
  }
});

export const isDark = writable(false);

if (browser) {
  theme.subscribe(($theme) => {
    localStorage.setItem('theme', $theme);
    if ($theme === 'system') isDark.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    else isDark.set(DARK_THEMES.has($theme));
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches }) => {
    if ((localStorage.getItem('theme') ?? 'system') === 'system') isDark.set(matches);
  });

  isDark.subscribe(($isDark) => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add($isDark ? 'dark' : 'light');
  });
}
