<script lang="ts">
  export let href: string;
  export let dashed = false;
</script>

<a {href}>
  <article class="document" class:dashed>
    <header>
      <h3><slot name="header" /></h3>
    </header>
    <p class="infos">
      <slot />
    </p>
  </article>
</a>

<style lang="scss">
  article {
    padding: 0.5em 1em;
    border: var(--border-block) solid var(--muted-border);
    border-radius: 0.5em;
  }

  a:not(:hover, :focus-visible) article.dashed {
    border-style: dashed;
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
