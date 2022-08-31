import { browser } from '$app/environment';
import { writable } from 'svelte/store';

/** Current theme, as a writable store. */
export const theme = writable('light', (set) => {
  // It's not possible to load the theme on the server
  if (!browser) return;

  // Try to load the theme from sessionStorage or fallback to a media query
  set(
    sessionStorage.getItem('theme') ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
});

if (browser) {
  theme.subscribe(($theme) => {
    sessionStorage.setItem('theme', $theme);
  });
}
