<script lang="ts">
  import { umamiAttributes } from '$lib/analytics';
  import { tooltip } from '$lib/tooltip';
  import { type SvelteComponent } from 'svelte';
  import IconSpinner from '~icons/mdi/loading';

  export let track = '';
  export let trackData: Record<string, string | number> = {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let icon: typeof SvelteComponent<any> | undefined = undefined;
  export let loading = false;
  export let circle = false;
  export let id = '';
  export let href: URL | string = '';
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
  export let stretches = false;
  export let noClientSideNavigation = false;
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  {...umamiAttributes(track, trackData)}
  target={newTab ? '_blank' : undefined}
  type={submits ? 'submit' : 'button'}
  use:tooltip={help || undefined}
  data-sveltekit-reload={noClientSideNavigation ? true : undefined}
  class="button-secondary typo-paragraph"
  class:danger
  class:highlighted
  class:success
  on:contextmenu
  class:stretches
  class:circle
  class:inside-prose={insideProse}
  href={disabled ? undefined : href?.toString()}
  {download}
  {formaction}
  {id}
  {...$$restProps}
  disabled={loading || disabled || undefined}
  class:muted={loading || (disabled && !success && !danger)}
  on:click
  role="button"
  {tabindex}
  on:contextmenu
>
  <div class="loading" class:visible={loading}>
    <IconSpinner />
  </div>
  {#if icon}
    <div class="icon">
      <svelte:component this={icon} />
    </div>
  {:else if $$slots.icon}
    <div class="icon">
      <slot name="icon"></slot>
    </div>
  {/if}
  <slot />
</svelte:element>

<style lang="scss">
  .button-secondary {
    position: relative;
    display: inline-flex;
    flex-grow: 0;
    flex-shrink: 0;
    gap: 0.5em;
    align-items: center;
    height: fit-content;
    padding: 0.25rem 0.75rem;

    // https://stackoverflow.com/a/68141091
    line-height: inherit;
    cursor: pointer;
    background: transparent;
    border: solid var(--border-block);
    border-radius: 5px;
    transition: all 200ms ease;
  }

  .button-secondary.stretches {
    flex-grow: 1;
    justify-content: center;
  }

  .button-secondary.highlighted {
    color: var(--primary);
    background: var(--primary-bg);
    border-color: var(--primary);
  }

  .button-secondary:disabled,
  .button-secondary[disabled] {
    cursor: not-allowed;

    --color: var(--shy);
  }

  .button-secondary:disabled:not(.muted) {
    opacity: 0.75;
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
    color: var(--original-bg);
    background: var(--color, var(--fg));
  }

  .icon {
    display: flex;
    align-items: center;
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
