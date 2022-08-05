<div class="card">
  <slot name="header" />
  <div class="card-content"><slot /></div>
  <slot name="footer" />
</div>

<style lang="scss">
  .card {
    margin: 1rem 0;
    overflow: hidden;
    border-radius: 0.5em;
    box-shadow: var(--shadow);
  }

  .card-content {
    padding: 0 1rem;
  }
</style>
