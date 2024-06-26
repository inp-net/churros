import { browser } from '$app/environment';
import { afterNavigate, beforeNavigate } from '$app/navigation';
import { page } from '$app/stores';
import { onMount } from 'svelte';
import { syncToLocalStorage } from 'svelte-store2storage';
import { get, writable, type Writable } from 'svelte/store';

export function scrollToTop(): void {
  if (!browser) return;

  document.querySelector('#scrollable-area')?.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

/**
 * Uses an intersection observer on a container to fire a callback when we are a certain number of elements within a container from reaching the bottom. Returns a function to stop listening.
 * @param scrollableArea the container to search elements in
 * @param scrollableElementSelector a query selector to identify elements
 * @param threshold fire the callback when the scroll position is within `threshold` elements from the end
 * @param callback a function to call when the scroll position is within `threshold` elements from the end.
 */
export function onReachingEndSoon(
  callback: () => Promise<void>,
  scrollableArea: HTMLElement,
  scrollableElementSelector: string,
  threshold = 3,
) {
  if (!browser) return () => {};

  async function restartIntersectionObserver() {
    // Get the element that's at threshold elements from the bottom
    const elements = [...scrollableArea.querySelectorAll(scrollableElementSelector)];
    const lastElement = elements.at(elements.length - threshold);
    // If there is no such element, we're at the bottom (or at least over the theshold)
    if (!lastElement) {
      await callback();
      return;
    }

    // Create an intersection observer to watch the last element
    const intersectionObserver = new IntersectionObserver(
      async (entries) => {
        // If the last element is in view, we're at the bottom
        if (entries.some((entry) => entry.isIntersecting)) {
          await callback();
          intersectionObserver.disconnect();
        }
      },
      { threshold: 1 },
    );

    // Start watching the last element
    intersectionObserver.observe(lastElement);
    return () => intersectionObserver.disconnect();
  }

  restartIntersectionObserver();

  // Every time elements change in the container (mutation observer)...
  const observer = new MutationObserver(restartIntersectionObserver);

  // Start observing the container
  observer.observe(scrollableArea, { childList: true });

  const infinitescrollBottom = scrollableArea.querySelector('[data-infinitescroll-bottom]');
  let infinitescrollBottomIntersectionObserver: IntersectionObserver | undefined;
  if (infinitescrollBottom) {
    // Also watch for intersection with the "infinitescroll bottom" element(data-infinitescroll-bottom)
    infinitescrollBottomIntersectionObserver = new IntersectionObserver(async (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        console.warn(
          `[infinitescroll] Reached data-infinitescroll-bottom, calling callback ${callback.name}`,
        );
        await callback();
      }
    });

    infinitescrollBottomIntersectionObserver.observe(infinitescrollBottom);
  }

  // Return a function to stop observing the container
  return () => {
    observer.disconnect();
    infinitescrollBottomIntersectionObserver?.disconnect();
  };
}

export const infinitescroll = (
  container: HTMLElement,
  callback: undefined | (() => Promise<void>),
) => {
  if (!callback) return;
  const disconnect = onReachingEndSoon(callback, container, ':scope > *');

  return {
    update(_callback: () => Promise<void>) {
      // TODO
    },
    destroy: () => disconnect(),
  };
};

export function setupScrollPositionRestorer(
  scrollableArea: HTMLElement,
  onScroll: (scrolled: boolean) => void,
) {
  /**
   * Stores scrollTop of scrollableArea per URL
   */
  const scrollPositions: Writable<Record<string, number>> = writable({});
  if (browser) syncToLocalStorage(scrollPositions, 'scroll_positions');

  beforeNavigate(() => {
    scrollPositions.set({
      ...get(scrollPositions),
      [get(page).url.pathname]: scrollableArea.scrollTop,
    });
  });

  afterNavigate(async () => {
    scrollableArea.scrollTo(0, get(scrollPositions)[get(page).url.pathname] ?? 0);
  });

  onMount(() => {
    const scrollableArea = document.querySelector('#scrollable-area');
    scrollableArea!.addEventListener('scroll', () => {
      onScroll(scrollableArea!.scrollTop >= 3);
    });
  });
}
