<slot />
<span class="separator" aria-hidden="true" />

<style lang="scss">
  .separator {
    width: 0.1em;
    height: 1em;
    background-color: currentcolor;
    transform: translateY(0.1em) skewX(-20deg);

    &:last-of-type {
      display: none;
    }
  }
</style>
