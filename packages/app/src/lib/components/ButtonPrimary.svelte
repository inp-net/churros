<script lang="ts">
  import { umamiAttributes } from '$lib/analytics';
  import { tooltip } from '$lib/tooltip';
  import IconLoading from '~icons/mdi/loading';

  export let track = '';
  export let trackData: Record<string, string | number> = {};

  export let id = '';
  export let href: string | undefined = undefined;
  export let submits = false;
  export let smaller = false;
  export let disabled = false;
  export let loading = false;
  export let help: string | undefined = undefined;
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  {...umamiAttributes(track, trackData)}
  {id}
  class:loading
  {href}
  class="button-primary typo-big-button primary"
  class:smaller
  disabled={disabled || loading || undefined}
  on:click
  use:tooltip={help}
  type={submits ? 'submit' : 'button'}
  role="button"
  tabindex="0"
>
  {#if loading}
    <div class="loading">
      <IconLoading />
    </div>
  {/if}
  <div class="content">
    <slot />
  </div>
</svelte:element>

<style lang="scss">
  .button-primary {
    position: relative;
    display: inline-flex;
    flex: initial;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.75rem;
    color: var(--text);
    cursor: pointer;
    background-color: var(--bg);
    border: none;
    border-radius: 1000px;

    &.loading .content {
      opacity: 0;
    }

    &[disabled] {
      color: var(--disabled-text);
      cursor: default;
      background: var(--disabled-bg);
    }
  }

  .button-primary.smaller {
    padding: 0.5rem 1rem;
  }

  .button-primary:hover:not([disabled]),
  .button-primary:focus-visible:not([disabled]) {
    color: var(--hover-text);
    background: var(--hover-bg);
  }

  .button-primary .loading {
    position: absolute;
    animation: infinite 500ms spinner;
  }

  @keyframes spinner {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
</style>
