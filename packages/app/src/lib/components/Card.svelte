<script>
  export let element = 'div';
</script>

<svelte:element this={element} class="card">
  <slot name="header" />
  <div class="card-content"><slot /></div>
  <slot name="footer" />
</svelte:element>

<style lang="scss">
  .card {
    margin: 1rem 0;
    overflow: hidden;
    background-color: var(--card-bg, transparent);
    border-radius: var(--radius-block);
    box-shadow: var(--shadow);
  }

  .card-content {
    padding: 1rem;
  }
</style>
