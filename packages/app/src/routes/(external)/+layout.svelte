<div class="content">
  <slot />
</div>

<style lang="scss">
  .content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 100vh;
    background: var(--muted-bg);
  }
</style>
