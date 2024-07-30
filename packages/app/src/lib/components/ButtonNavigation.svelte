<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import type { LayoutRouteId } from '../../routes/(app)/$types';
  import { page } from '$app/stores';
  import { tooltip } from '$lib/tooltip';

  export let href: string;
  export let routeID: LayoutRouteId;
  export let label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let icon: typeof SvelteComponent<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let iconFilled: typeof SvelteComponent<any> = icon;

  $: isCurrent = (route: LayoutRouteId) => $page.route.id === route;
</script>

<svelte:element
  this={isCurrent(routeID) ? 'button' : 'a'}
  {href}
  class="button-navigation"
  role={isCurrent(routeID) ? 'button' : 'link'}
  class:current={isCurrent(routeID)}
  use:tooltip={{ content: label, placement: 'left' }}
  on:click={isCurrent(routeID) ? () => window.scrollTo({ top: 0, behavior: 'smooth' }) : undefined}
>
  {#if isCurrent(routeID)}
    <svelte:component this={iconFilled}></svelte:component>
  {:else}
    <svelte:component this={icon}></svelte:component>
  {/if}
</svelte:element>

<style>
  .current {
    color: var(--primary);
  }

  .button-navigation {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.25s ease;
  }

  button {
    padding: 0;
    font-size: 1em;
    cursor: pointer;
  }
</style>
