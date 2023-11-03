<script lang="ts">
  import { tooltip } from '$lib/tooltip';

  export let type: 'button' | 'reset' | 'submit' = 'button';
  export let darkShadow = false;
  export let help = '';
  export let danger = false;
  export let success = false;
  export let disabled = false;
  export let href = '';
  export let tight = false;
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  role="button"
  tabindex="0"
  title={help}
  {...$$restProps}
  class:dark-shadow={darkShadow}
  class:disabled
  class:tight
  {disabled}
  {type}
  {href}
  use:tooltip={help}
  class="button-ghost {danger ? 'danger' : ''} {success ? 'success' : ''} {$$restProps.class}"
  on:click
  on:mousedown><slot /></svelte:element
>

<style lang="scss">
  .button-ghost.danger,
  .button-ghost.success {
    color: var(--link);
  }

  .button-ghost {
    --bg: transparent;

    all: unset;
    flex-shrink: 0;
    width: max-content;
    padding: 0.25em;

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
