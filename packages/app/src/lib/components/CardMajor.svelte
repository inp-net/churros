<script lang="ts">
  import { fragment, graphql, type CardMajor } from '$houdini';

  export let href: string;

  export let major: CardMajor;
  $: Major = fragment(
    major,
    graphql`
      fragment CardMajor on Major {
        name
        shortName
      }
    `,
  );

  $: ({ name, shortName } = $Major);
</script>

<a {href}>
  <article class="document">
    <header>
      <h3>{shortName || name}</h3>
    </header>
    <p class="infos">
      {#if shortName}
        {name}
      {/if}
    </p>
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
