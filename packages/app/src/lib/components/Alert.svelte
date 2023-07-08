<script lang="ts">
  import { slide } from 'svelte/transition';

  export let closed = false;
  export let inline = false;

  export let theme: 'default' | 'primary' | 'success' | 'danger' | 'warning' = 'default';
</script>

{#if !closed}
  <div class="alert {theme} {inline ? 'alert-inline' : ''}" role="alert" transition:slide|local>
    <slot />
  </div>
{/if}

<style lang="scss">
  .alert {
    padding: 1rem 2rem;
    margin: 1rem 0;
    color: var(--text);
    background-color: var(--bg);
    border: var(--border-block) solid var(--border);
    border-radius: var(--radius-block);
  }

  .alert-inline {
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-inline);
  }
</style>
