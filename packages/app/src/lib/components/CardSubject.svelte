<script lang="ts">
  import { formatRelative } from 'date-fns';
  import fr from 'date-fns/locale/fr/index.js';

  export let href: string;
  export let documentsCount: number;
  export let nextExamAt: Date | undefined = undefined;
  export let name: string;
  export let shortName: string;
  export let semester: number | undefined = undefined;
  export let yearTier: number | undefined = undefined;

  // Converts relative (1=first or 2=second) semester to absolute (S5, S6, etc) semester. Behavior for relativeSemester>2 is undefined.
  function absoluteSemester(relativeSemester: number) {
    return 4 + (yearTier ?? 0) + (relativeSemester - 1) * 2;
  }
</script>

<a {href}>
  <article class="document">
    <header>
      <h3>
        <span class="semester muted">
          {#if semester}
            S{absoluteSemester(semester)}
            <!-- {:else}
            S{absoluteSemester(1)}+S{absoluteSemester(2)} -->
          {/if}
        </span>
        {shortName || name}
      </h3>
    </header>
    <p class="infos">
      {#if nextExamAt}
        <span class="exam-date"
          >Partiel <strong class="primary">
            {formatRelative(nextExamAt, new Date(), {
              locale: fr,
              weekStartsOn: 1,
            })}
          </strong></span
        > ·
      {/if}
      <span class:muted={documentsCount < 1} class="documents-count"
        >{#if documentsCount}{documentsCount} document{documentsCount > 1 ? 's' : ''}{:else}Aucun
          document{/if}</span
      >
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
