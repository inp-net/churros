<script lang="ts">
  import IconCheck from '~icons/mdi/check-circle';
  import IconWarning from '~icons/mdi/alert-circle';
  import { formatDate } from '$lib/dates';
  import { fragment, graphql, type CardDocument } from '$houdini';

  export let href: string;
  export let document: CardDocument;
  $: Document = fragment(
    document,
    graphql`
      fragment CardDocument on Document {
        title
        createdAt
        schoolYear
        hasSolution
      }
    `,
  );

  $: ({ title, createdAt, schoolYear, hasSolution } = $Document);
</script>

<a {href}>
  <article class="document">
    <header>
      <h3>{title}</h3>
    </header>
    <p class="infos">
      {#if schoolYear}
        <span class="date">{schoolYear}–{schoolYear + 1}</span>
      {:else}
        <span class="date">{formatDate(createdAt)}</span>
      {/if}
      {#if hasSolution !== null}
        <span class="separator">·</span>
        <span class:warning={!hasSolution} class:success={hasSolution} class="has-solution">
          {#if hasSolution}<IconCheck></IconCheck>
          {:else}
            <IconWarning></IconWarning>
          {/if}
          {hasSolution ? 'Corrigé' : 'Pas de corrigé'}</span
        >
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

  .has-solution {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 0.25em;
    align-items: center;
    color: var(--link);
  }

  .has-solution :global(svg) {
    font-size: 0.75em;
  }
</style>
