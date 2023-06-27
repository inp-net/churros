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
    gap: 0.5em;
    align-items: center;
    padding: 0.25rem 0.75rem;
    cursor: pointer;
    background: var(--bg);
    border: var(--border-block) solid var(--border);
    border-radius: 1000px;
  }

  .button-secondary.inside-prose {
    margin: 0.5rem;
  }

  .button-secondary:hover,
  .button-secondary:focus-visible {
    /* color: var(--bg); */
    background: var(--border);
  }

  .icon {
    display: flex;
    justify-content: center;
    width: 1.15em;
    height: 1.15em;
  }

  .icon > :global(svg) {
    width: 100%;
    height: 100%;
  }
</style>
