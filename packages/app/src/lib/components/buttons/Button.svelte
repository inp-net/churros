<script lang="ts">
  export let type: 'button' | 'reset' | 'submit' = 'button';

  export let disabled = false;
  export let loading = false;

  export let theme: 'default' | 'primary' | 'success' | 'danger' | 'warning' = 'default';
</script>

<button {type} disabled={disabled || loading} class={theme} class:loading {...$$restProps} on:click>
  <div class="icon">
    <slot name="icon" />
  </div>
  <slot />
</button>

<style lang="scss">
  button {
    position: relative;
    flex: 0;
  }

  button::before {
    position: absolute;
    top: calc(50% - 0.5em);
    left: calc(50% - 0.5em);
    width: 1em;
    height: 1em;
    content: '';
    border: 2px solid transparent;
    border-radius: 50%;
    animation: spin 0.5s linear infinite;
  }

  .loading {
    color: transparent;

    &::before {
      border-color: var(--text) var(--text) transparent transparent;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
