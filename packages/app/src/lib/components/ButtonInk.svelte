<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import LoadingSpinner from './LoadingSpinner.svelte';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let icon: typeof SvelteComponent<any> | undefined = undefined;
  export let href = '';
  export let insideProse = false;
  export let submits = false;
  export let danger = false;
  export let loading = false;
  export let disabled = false;
  export let newTab = false;
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  type={submits ? 'submit' : 'button'}
  class="button-ink"
  class:danger
  class:inside-prose={insideProse}
  href={disabled ? '#' : href}
  {...$$restProps}
  on:click
  role="button"
  target={newTab ? '_blank' : undefined}
  tabindex="0"
  disabled={disabled || loading}
>
  {#if loading}
    <div class="icon">
      <LoadingSpinner></LoadingSpinner>
    </div>
  {:else if icon}
    <div class="icon">
      <svelte:component this={icon} />
    </div>
  {/if}
  <slot />
</svelte:element>

<style>
  .button-ink {
    display: inline-flex;
    gap: 0.5em;
    align-items: center;
    padding: 0.25em 0.5em;
    font-size: inherit;
    font-weight: bold;
    color: var(--link);
    text-transform: uppercase;
    letter-spacing: 0.07em;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: var(--radius-inline);
    box-shadow: none;
  }

  /* <a> elements don't have disabled={false} -> (no attribute in DOM) treatment, so Svelte just stringifies it to false. We still wanna have disabled link buttons though. */
  .button-ink[disabled]:not([disabled='false']) {
    color: var(--muted-text);
    cursor: not-allowed;
  }

  .button-ink.inside-prose {
    gap: 0.25em;
    padding: 0 0.25em;
  }

  .button-ink:hover,
  .button-ink:focus-visible {
    --link: var(--hover-text);

    background: var(--hover-bg);
  }
</style>
