<script lang="ts">
  import IconLoading from '~icons/mdi/loading';
  export let id = '';
  export let href: string | undefined = undefined;
  export let submits = false;
  export let smaller = false;
  export let disabled = false;
  export let loading = false;
</script>

<svelte:element
  this={href ? 'a' : 'button'}
  {id}
  class:loading
  {href}
  class="button-primary typo-big-button"
  class:smaller
  disabled={disabled || loading}
  on:click
  type={submits ? 'submit' : 'button'}
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
    color: var(--primary-text);
    cursor: pointer;
    background: var(--primary-bg);
    border: none;
    border-radius: 1000px;

    &.loading .content {
      opacity: 0;
    }
  }

  .button-primary.smaller {
    padding: 0.75rem 1.5rem;
  }

  .button-primary:hover,
  .button-primary:focus-visible {
    color: var(--primary-hover-text);
    background: var(--primary-hover-bg);
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
