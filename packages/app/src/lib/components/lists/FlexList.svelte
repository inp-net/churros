<script lang="ts">
  export let horizontal = false;
</script>

<ul class:horizontal>
  <slot />
</ul>

<style lang="scss">
  ul {
    display: flex;
    flex-flow: column wrap;
    gap: 0.5rem;
    align-items: flex-start;
    padding: 0;
    list-style: none;

    > :global(li),
    > :global(li > a) {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      color: inherit;
    }
  }

  ul.horizontal {
    flex-direction: row;
  }
</style>
