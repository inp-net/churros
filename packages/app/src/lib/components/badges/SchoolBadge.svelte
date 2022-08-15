<script lang="ts">
  // @ts-expect-error Untyped lib
  import isDarkColor from 'is-dark-color';

  export let schools: Array<{ name: string; color: string }>;
</script>

<span class="badge">
  {#each schools as { name, color }}
    <span style:--bg={color} style:--text={isDarkColor(color) ? 'white' : 'black'}>
      {name}
    </span>
  {/each}
</span>

<style lang="scss">
  .badge {
    display: inline-flex;
    flex-wrap: wrap;
    overflow: hidden;
    vertical-align: bottom;
    border-radius: var(--radius-inline);

    > * {
      flex: 1;
      padding: 0 0.25em;
      color: var(--text);
      text-align: center;
      background: var(--bg);
    }

    > :first-child {
      padding-inline-start: 0.5em;
    }

    > :last-child {
      padding-inline-end: 0.5em;
    }
  }
</style>
