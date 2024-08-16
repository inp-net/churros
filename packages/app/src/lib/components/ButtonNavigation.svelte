<script lang="ts">
  import { createEventDispatcher, type SvelteComponent } from 'svelte';
  import type { LayoutRouteId } from '../../routes/(app)/$types';
  import { page } from '$app/stores';
  import { tooltip } from '$lib/tooltip';
  import { scrollableContainer } from '$lib/scroll';
  import { isMobile } from '$lib/mobile';

  const dispatch = createEventDispatcher<{ click: undefined }>();

  export let href: string;
  /** If null, only highlighted when current page is href. */
  export let routeID: LayoutRouteId | null;
  export let label: string | undefined = undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let icon: typeof SvelteComponent<any> | undefined = undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let iconFilled: typeof SvelteComponent<any> | undefined = icon;
  export let tooltipsOn: 'left' | 'right' | 'top' | 'bottom' = 'top';

  const mobile = isMobile();

  $: isCurrent = (route: LayoutRouteId | null, href: string) =>
    route ? $page.route.id === route : $page.url.pathname === href;
</script>

<svelte:element
  this={isCurrent(routeID, href) ? 'button' : 'a'}
  {href}
  class="button-navigation"
  role={isCurrent(routeID, href) ? 'button' : 'link'}
  class:current={isCurrent(routeID, href)}
  use:tooltip={label ? { content: label, placement: tooltipsOn } : undefined}
  on:click={isCurrent(routeID, href)
    ? () => {
        scrollableContainer(mobile).scrollTo({ top: 0, behavior: 'smooth' });
        dispatch('click');
      }
    : undefined}
>
  <slot>
    {#if isCurrent(routeID, href)}
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

  .button-navigation {
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
