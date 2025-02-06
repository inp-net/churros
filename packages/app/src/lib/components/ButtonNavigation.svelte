<script lang="ts">
  import { createEventDispatcher, type SvelteComponent } from 'svelte';
  import type { LayoutRouteId } from '../../routes/(app)/$types';
  import { page } from '$app/stores';
  import { tooltip } from '$lib/tooltip';
  import { scrollableContainer } from '$lib/scroll';
  import { isMobile } from '$lib/mobile';
  import type { Page } from '@sveltejs/kit';

  const dispatch = createEventDispatcher<{ click: undefined }>();

  export let href: string;
  /** If null, only highlighted when current page is href. Pass an array, if any of the provided route IDs match, item will be highlighted. */
  export let routeID: LayoutRouteId | LayoutRouteId[] | null;
  export let label: string | undefined = undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let icon: typeof SvelteComponent<any> | undefined = undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let iconFilled: typeof SvelteComponent<any> | undefined = icon;
  export let tooltipsOn: 'left' | 'right' | 'top' | 'bottom' = 'top';

  /** Show a little red dot on the button to catch the attention of the user. The badge is not shown when the button is highlighted (if the user is on the page, we don't have to grab their attention anymore) */
  export let badge = false;

  const mobile = isMobile();

  function isPathwiseEqual(a: URL, b: URL) {
    return a.pathname.replace(/\/$/, '') === b.pathname.replace(/\/$/, '');
  }

  function isCurrent(
    route: LayoutRouteId | LayoutRouteId[] | null,
    href: string,
    page: Page,
  ): boolean {
    if (Array.isArray(route)) return route.some((r) => isCurrent(r, href, page));
    if (route) return page.route.id === route;
    return isPathwiseEqual(new URL(href, page.url), page.url);
  }

  $: current = isCurrent(routeID, href, $page);
</script>

<svelte:element
  this={current ? 'button' : 'a'}
  {href}
  class="button-navigation"
  class:has-red-dot={badge && !current}
  role={current ? 'button' : 'link'}
  class:current
  use:tooltip={label ? { content: label, placement: tooltipsOn } : undefined}
  on:click={current
    ? () => {
        scrollableContainer(mobile).scrollTo({ top: 0, behavior: 'smooth' });
        dispatch('click');
      }
    : undefined}
>
  <slot>
    {#if current}
      <svelte:component this={iconFilled}></svelte:component>
    {:else if icon}
      <svelte:component this={icon}></svelte:component>
    {/if}
  </slot>
</svelte:element>

<style>
  .current {
    color: var(--primary);
  }

  .has-red-dot::after {
    position: absolute;
    top: 0;
    right: 0;
    width: 0.5em;
    height: 0.5em;
    content: '';
    background-color: var(--danger);
    border-radius: 50%;
  }

  .button-navigation {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      color 0.25s ease,
      transform 0.5s ease;
  }

  .button-navigation:active {
    transform: scale(0.5);
  }

  button {
    padding: 0;
    font-size: 1em;
    cursor: pointer;
  }
</style>
