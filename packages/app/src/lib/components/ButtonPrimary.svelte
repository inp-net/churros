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
  class="button-primary primary"
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
    padding: 0.25rem 0.75rem;
    color: var(--original-bg);
    cursor: pointer;
    background-color: var(--primary);
    border: var(--border-block) solid var(--primary);
    border-radius: 5px;

    &.loading .content {
      opacity: 0;
    }

    &[disabled] {
      color: var(--disabled-text);
      cursor: default;
      background: var(--disabled-bg);
    }
  }

  .button-primary:hover:not([disabled]),
  .button-primary:focus-visible:not([disabled]) {
    background: color-mix(in srgb, var(--primary) 70%, var(--fg));
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
