<script>
  export let element = 'article';
  export let dashedBorder = false;
</script>

<svelte:element
  this={element}
  {...$$restProps}
  class="card"
  class:dashed-border={dashedBorder}
  on:submit|preventDefault
>
  <slot name="header" />
  <div class="card-content"><slot /></div>
  <slot name="footer" />
</svelte:element>

<style lang="scss">
  .card {
    margin: 1rem 0;
    background-color: var(--card-bg, var(--bg));
    border-radius: var(--radius-block);
    box-shadow: var(--shadow);
  }

  .card.dashed-border {
    border: var(--border-block) dashed;
    box-shadow: none;
  }

  .card-content {
    padding: 1rem;
  }
</style>
