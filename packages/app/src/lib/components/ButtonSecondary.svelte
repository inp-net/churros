<script lang="ts">
  import { tooltip } from '$lib/tooltip';
  import type { SvelteComponent } from 'svelte';
  import IconSpinner from '~icons/mdi/loading';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let icon: typeof SvelteComponent<any> | undefined = undefined;
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
  export let tabindex = 0;
  export let help = '';
  export let highlighted = false;
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  target={newTab ? '_blank' : undefined}
  type={submits ? 'submit' : 'button'}
  use:tooltip={help || undefined}
  class="button-secondary typo-paragraph"
  class:danger
  class:highlighted
  class:success
  class:circle
  class:inside-prose={insideProse}
  href={disabled ? undefined : href}
  {download}
  {formaction}
  {id}
  {...$$restProps}
  disabled={loading || disabled || undefined}
  class:muted={loading || disabled}
  on:click
  role="button"
  {tabindex}
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
    height: fit-content;
    padding: 0.25rem 0.75rem;
    color: var(--text);
    cursor: pointer;
    background: var(--bg);
    border: var(--border-block) solid var(--border);
    border-radius: 1000px;
    transition: all 200ms ease;
  }

  .button-secondary.highlighted {
    color: var(--primary-bg);
    background-color: #9ce0ff;
    border-color: var(--primary-bg);
  }

  .button-secondary:disabled,
  .button-secondary[disabled] {
    cursor: not-allowed;
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
    background: var(--secondary-bg);
    border: var(--border-block) solid var(--secondary-hover-bg);
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
    transition: all 500ms ease;
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
