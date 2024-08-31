import { browser } from '$app/environment';
import type { Navigation } from '@sveltejs/kit';

export function setupViewTransition(navigation: Navigation) {
  if (!browser) return;
  if (!document.startViewTransition) return;

  return new Promise<void>((resolve) => {
    document.startViewTransition(async () => {
      resolve();
      await navigation.complete;
    });
  });
}
