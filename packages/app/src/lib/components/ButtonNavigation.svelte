<script lang="ts">
  import { createEventDispatcher, type SvelteComponent } from 'svelte';
  import type { LayoutRouteId } from '../../routes/(app)/$types';
  import { page } from '$app/stores';
  import { tooltip } from '$lib/tooltip';

  const dispatch = createEventDispatcher<{ click: undefined }>();

  export let href: string;
  export let routeID: LayoutRouteId;
  export let label: string | undefined = undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let icon: typeof SvelteComponent<any> | undefined = undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let iconFilled: typeof SvelteComponent<any> | undefined = icon;

  $: isCurrent = (route: LayoutRouteId) => route && $page.route.id === route;
</script>

<svelte:element
  this={isCurrent(routeID) ? 'button' : 'a'}
  {href}
  class="button-navigation"
  role={isCurrent(routeID) ? 'button' : 'link'}
  class:current={isCurrent(routeID)}
  use:tooltip={label ? { content: label, placement: 'left' } : undefined}
  on:click={isCurrent(routeID)
    ? () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        dispatch('click');
      }
    : undefined}
>
  <slot>
    {#if isCurrent(routeID)}
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
