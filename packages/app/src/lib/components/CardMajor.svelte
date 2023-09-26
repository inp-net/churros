<script lang="ts">
  export let href: string;
  export let name: string;
  export let shortName = '';
</script>

<a {href}>
  <article class="document">
    <header>
      <h3>{shortName || name}</h3>
    </header>
    <p class="infos"></p>
  </article>
</a>

<style lang="scss">
  article {
    padding: 0.5em 1em;
    border: var(--border-block) solid var(--muted-border);
    border-radius: 0.5em;
  }

  a:hover,
  a:focus-visible {
    article {
      background-color: var(--hover-bg);
      border-color: var(--border);
    }
  }

  .infos {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.5em;
    align-items: center;
  }
</style>
