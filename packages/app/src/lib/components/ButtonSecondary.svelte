<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  export let icon: typeof SvelteComponent | undefined = undefined;
  export let id = '';
  export let href = '';
  export let formaction: string | undefined = undefined;
  export let danger = false;
  export let submits = false;
  export let download: string | undefined = undefined;
  export let insideProse = false;
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  type={submits ? 'submit' : 'button'}
  class="button-secondary typo-paragraph"
  class:danger
  class:inside-prose={insideProse}
  {href}
  {download}
  {formaction}
  {id}
  on:click
>
  {#if icon}
    <div class="icon">
      <svelte:component this={icon} />
    </div>
  {/if}
  <slot />
</svelte:element>

<style>
  .button-secondary {
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.25rem 0.75rem;

    background: var(--bg);
    border: var(--border-width) solid var(--text);
    border-radius: 1000px;

    cursor: pointer;
  }

  .button-secondary.inside-prose {
    margin: 0.5rem;
  }

  .button-secondary:hover,
  .button-secondary:focus {
    background: var(--text);
    color: var(--bg);
    --icon-color: var(--bg);
  }

  .icon {
    height: 1em;
    width: 1em;
  }
</style>
