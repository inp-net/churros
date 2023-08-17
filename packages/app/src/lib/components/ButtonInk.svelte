<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  export let icon: typeof SvelteComponent<any> | undefined = undefined;
  export let href = '';
  export let insideProse = false;
  export let submits = false;
  export let danger = false;
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  type={submits ? 'submit' : 'button'}
  class="button-ink"
  class:danger
  class:inside-prose={insideProse}
  {href}
  {...$$restProps}
  on:click
  role="button"
  tabindex="0"
>
  {#if icon}
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
    font-weight: bold;
    color: var(--primary-bg);
    text-transform: uppercase;
    letter-spacing: 0.07em;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: var(--radius-inline);
    box-shadow: none;
  }

  .button-ink:hover,
  .button-ink:focus-visible {
    --text: var(--hover-text);

    background: var(--hover-bg);
  }
</style>
