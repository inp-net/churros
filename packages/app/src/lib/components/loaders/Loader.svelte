<div class="icon" />

<style lang="scss">
  div {
    position: relative;

    &::before {
      position: absolute;
      inset: 10%;
      content: '';
      border: 6.6667px solid transparent;
      border-color: var(--text) var(--text) transparent transparent;
      border-radius: 50%;
      animation: spin 0.5s linear infinite;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
