import { browser } from '$app/environment';

export function scrollToTop(): void {
  if (!browser) return;

  document.querySelector('#scrollable-area')?.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}
