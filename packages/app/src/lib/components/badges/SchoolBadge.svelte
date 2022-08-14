<script lang="ts">
  // @ts-expect-error Untyped lib
  import isDarkColor from 'is-dark-color';

  export let schools: Array<{ name: string; color: string }>;
</script>

<span class="badge">
  {#each schools as { name, color }}
    <span style:background-color={color} style:color={isDarkColor(color) ? 'white' : 'black'}
      >{name}</span
    >
  {/each}
</span>

<style lang="scss">
  .badge {
    overflow: hidden;
    border-radius: var(--radius-inline);

    > * {
      padding: 0 0.25em;
    }

    > :first-child {
      padding-inline-start: 0.5em;
    }

    > :last-child {
      padding-inline-end: 0.5em;
    }
  }
</style>
