<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import IconSpinner from '~icons/mdi/loading';

  export let icon: typeof SvelteComponent | undefined = undefined;
  export let loading = false;
  export let circle = false;
  export let id = '';
  export let href = '';
  export let formaction: string | undefined = undefined;
  export let danger = false;
  export let success = false;
  export let submits = false;
  export let download: string | undefined = undefined;
  export let insideProse = false;
  export let disabled = false;
  export let newTab = false;
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  target={newTab ? '_blank' : undefined}
  type={submits ? 'submit' : 'button'}
  class="button-secondary typo-paragraph"
  class:danger
  class:success
  class:circle
  class:inside-prose={insideProse}
  {href}
  {download}
  {formaction}
  {id}
  {...$$restProps}
  disabled={loading || disabled}
  on:click
>
  <div class="loading" class:visible={loading}>
    <IconSpinner />
  </div>
  {#if icon}
    <div class="icon">
      <svelte:component this={icon} />
    </div>
  {/if}
  <slot />
</svelte:element>

<style>
  .button-secondary {
    position: relative;
    display: inline-flex;
    flex-grow: 0;
    flex-shrink: 0;
    gap: 0.5em;
    align-items: center;
    padding: 0.25rem 0.75rem;
    color: var(--text);
    cursor: pointer;
    background: var(--bg);
    border: var(--border-block) solid var(--border);
    border-radius: 1000px;
  }

  .button-secondary:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .button-secondary.circle {
    padding: 0.5rem;
    font-size: 1.2em;
  }

  .button-secondary.inside-prose {
    margin: 0.5rem;
  }

  .button-secondary:not(:disabled):hover,
  .button-secondary:not(:disabled):focus-visible {
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

  .loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 500ms ease;
  }

  .loading.visible {
    opacity: 1;
  }

  .loading > :global(svg) {
    animation: spinner 700ms infinite;
  }

  @keyframes spinner {
    from {
      transform: rotate(0);
    }

    to {
      transform: rotate(1turn);
    }
  }
</style>
