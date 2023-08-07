import { browser } from '$app/environment';
import { derived, readable, writable } from 'svelte/store';

/** Current theme, as a writable store. */
export const theme = writable('system', (set) => {
  // It's not possible to load the theme on the server
  if (!browser) return;

  // Try to load the theme from sessionStorage or fallback to a media query
  set(sessionStorage.getItem('theme') ?? 'system');
});

export const isDark = writable(false);

if (browser) {
  theme.subscribe(($theme) => {
    sessionStorage.setItem('theme', $theme);
    if ($theme === 'system') isDark.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    else isDark.set($theme === 'dark');
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches }) => {
    if ((sessionStorage.getItem('theme') ?? 'system') === 'system') {
      document.documentElement.classList.remove('dark', 'light');
      isDark.set(matches);
      document.documentElement.classList.add(matches ? 'dark' : 'light');
    }
  });
}
