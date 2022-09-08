<div class="row">
  <div class="cell">
    <slot />
  </div>
  {#if $$slots.actions}
    <div class="actions">
      <slot name="actions" />
    </div>
  {/if}
</div>

<style lang="scss">
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.5rem;
    overflow: hidden;
    border-radius: var(--radius-inline);
    box-shadow: var(--shadow);
  }

  .cell {
    display: flex;
    flex: 1;
    flex-basis: 20rem;
    flex-direction: column;
    padding: 0;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    justify-content: flex-start;
  }
</style>
