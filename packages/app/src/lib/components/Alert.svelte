<script lang="ts">
  import { slide } from 'svelte/transition';

  export let closed = false;
  export let inline = false;
  export let fullwidth = false;

  export let theme: 'default' | 'primary' | 'success' | 'danger' | 'warning' = 'default';
</script>

{#if !closed}
  <div
    class:fullwidth
    class="alert {theme} {inline ? 'alert-inline' : ''}"
    role="alert"
    transition:slide
  >
    <slot />
  </div>
{/if}

<style lang="scss">
  .alert {
    padding: 1rem 1.5rem;
    background-color: var(--bg);
    border-radius: var(--radius-block);
  }

  .default {
    border: var(--border-block) solid;
  }

  .alert-inline {
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-inline);
  }

  .alert.fullwidth {
    border-radius: 0;
  }
</style>
