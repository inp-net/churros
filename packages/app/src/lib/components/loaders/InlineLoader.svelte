<span class="icon" />

<style lang="scss">
  .icon {
    position: relative;
    display: inline-block;
    width: 1.5rem;
    height: 1.5rem;

    &::before {
      position: absolute;
      top: calc(50% - 0.5em);
      left: calc(50% - 0.5em);
      width: 1em;
      height: 1em;
      content: '';
      border: 2px solid transparent;
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
