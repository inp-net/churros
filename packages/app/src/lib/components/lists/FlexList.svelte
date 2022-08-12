<ul>
  <slot />
</ul>

<style lang="scss">
  ul {
    padding: 0;
    list-style: none;

    > :global(li) {
      padding: 0.25rem 0;
    }

    > :global(li),
    > :global(li > a) {
      display: flex;
      gap: 0.5rem;
      color: inherit;
    }
  }
</style>
