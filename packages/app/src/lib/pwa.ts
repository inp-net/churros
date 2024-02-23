import { browser } from '$app/environment';

export function isPWA() {
  if (!browser) return false;
  return window.matchMedia('(display-mode: standalone)').matches;
}
