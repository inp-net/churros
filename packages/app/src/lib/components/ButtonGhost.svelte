<script lang="ts">
  import { umamiAttributes } from '$lib/analytics';
  import { tooltip } from '$lib/tooltip';

  export let track = '';
  export let trackData: Record<string, string | number> = {};

  export let type: 'button' | 'reset' | 'submit' = 'button';
  export let darkShadow = false;
  export let help = '';
  export let danger = false;
  export let success = false;
  export let disabled = false;
  export let href = '';
  export let tight = false;
  export let inline = false;
  export let loading = false;
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  {...umamiAttributes(track, trackData)}
  role="button"
  tabindex="0"
  title={help}
  {...$$restProps}
  class:dark-shadow={darkShadow}
  class:disabled
  class:inline
  class:tight
  {disabled}
  {type}
  {href}
  use:tooltip={help}
  class="button-ghost {danger ? 'danger' : ''} {success ? 'success' : ''} {$$restProps.class}"
  on:click
  on:mousedown
  class:skeleton-effect-wave={loading}
>
  {#if loading}
    <div class="loading-blackout"><slot /></div>
  {:else}
    <slot />
  {/if}
</svelte:element>

<style lang="scss">
  .button-ghost.skeleton-effect-wave {
    background: var(--muted-border);
  }

  .loading-blackout {
    opacity: 0;
  }

  .button-ghost.danger,
  .button-ghost.success {
    color: var(--link);
  }

  .button-ghost {
    --bg: transparent;

    flex-shrink: 0;
    width: max-content;
    padding: 0.25em;
    font-size: 1em;

    &.tight {
      padding: 0;
    }

    color: var(--text);
    word-wrap: break-word;
    white-space: normal;
    background: var(--bg);
    border: var(--border-inline) solid transparent;
    border-radius: var(--radius-inline);
    outline: 0 solid var(--ring);

    &.disabled {
      cursor: not-allowed;
      opacity: 0.75;
    }

    &:not(.disabled) {
      cursor: pointer;

      &:focus-visible {
        outline-width: 0.25rem;
      }

      &:hover,
      &:focus-visible {
        --text: var(--hover-text);

        &.danger,
        &.success {
          --text: var(--hover-text);

          background: var(--bg);
        }

        &:not(.dark-shadow) {
          background: var(--hover-bg);
        }

        &.dark-shadow {
          background: rgba($color: #fff, $alpha: 50%);
        }
      }
    }
  }
</style>
