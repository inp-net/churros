import { browser } from '$app/environment';
import { writable } from 'svelte/store';

/** Current theme, as a writable store. */
export const theme = writable('system', (set) => {
  // It's not possible to load the theme on the server
  if (!browser) return;

  // Try to load the theme from sessionStorage or fallback to a media query
  set(sessionStorage.getItem('theme') ?? 'system');
});

if (browser) {
  theme.subscribe(($theme) => {
    sessionStorage.setItem('theme', $theme);
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches }) => {
    if ((sessionStorage.getItem('theme') ?? 'system') === 'system') {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(matches ? 'dark' : 'light');
    }
  });
}
