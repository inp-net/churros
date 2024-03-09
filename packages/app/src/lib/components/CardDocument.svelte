<script lang="ts">
  import IconCheck from '~icons/mdi/check-circle';
  import IconWarning from '~icons/mdi/alert-circle';
  import { formatDate } from '$lib/dates';

  export let href: string;
  export let hasSolution: boolean | undefined = undefined;
  export let title: string;
  export let createdAt: Date;
  export let schoolYear: number | undefined | null = undefined;
  export let add = false;
</script>

<a {href}>
  <article class="document" class:add>
    <header>
      <h3>{title}</h3>
    </header>
    <p class="infos">
      {#if add}
        <span class="muted">Contribue à la Frappe :)</span>
      {:else}
        {#if schoolYear}
          <span class="date">{schoolYear}–{schoolYear + 1}</span>
        {:else}
          <span class="date">{formatDate(createdAt)}</span>
        {/if}
        {#if hasSolution !== undefined}
          <span class="separator">·</span>
          <span class:warning={!hasSolution} class:success={hasSolution} class="has-solution">
            {#if hasSolution}<IconCheck></IconCheck>
            {:else}
              <IconWarning></IconWarning>
            {/if}
            {hasSolution ? 'Corrigé' : 'Pas de corrigé'}</span
          >
        {/if}
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

  a:not(:hover, :focus-visible) article.add {
    border-style: dashed;
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
