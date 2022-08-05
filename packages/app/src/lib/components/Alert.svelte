<script lang="ts">
  import { slide } from 'svelte/transition';

  export let closed = false;

  export let theme: 'default' | 'primary' | 'success' | 'danger' | 'warning' = 'default';
</script>

{#if !closed}
  <div class="alert {theme}" transition:slide|local><slot /></div>
{/if}

<style lang="scss">
  .alert {
    padding: 0 1rem;
    margin: 1rem 0;
    color: var(--text);
    background-color: var(--bg);
    border: var(--border-block) solid var(--border);
    border-radius: var(--radius-block);
  }
</style>
