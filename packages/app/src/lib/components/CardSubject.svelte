<script lang="ts">
  import IconAdd from '~icons/mdi/plus';
  import { formatRelative } from 'date-fns';
  import fr from 'date-fns/locale/fr/index.js';
  import ButtonInk from './ButtonInk.svelte';

  export let href: string;
  export let emoji: string;
  export let createHref = `${href}/create`;
  export let documentsCount: number;
  export let nextExamAt: Date | null = null;
  export let name: string;
  export let shortName: string;
  export let semester: number | null = null;
  export let yearTier: number | null = null;
  export let unit: { shortName: string; name: string } | null = null;

  // Converts relative (1=first or 2=second) semester to absolute (S5, S6, etc) semester. Behavior for relativeSemester>2 is undefined.
  function absoluteSemester(relativeSemester: number) {
    return 5 + ((yearTier ?? 0) - 1) * 2 + (relativeSemester - 1);
  }
</script>

<a {href}>
  <article class="document">
    {#if emoji}
      <div class="emoji">{emoji}</div>
    {/if}
    <div class="text">
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
        {#if unit}
          <span class="unit">
            UE {unit.shortName || unit.name}
          </span> ·
        {/if}
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
            document
            <span class="contribute">
              <ButtonInk insideProse icon={IconAdd} href={createHref}>Contribuer</ButtonInk>
            </span>
          {/if}</span
        >
      </p>
    </div>
  </article>
</a>

<style lang="scss">
  article {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 0.5em 1em;
    border: var(--border-block) solid var(--muted-border);
    border-radius: 0.5em;
  }

  .emoji {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    font-size: 1.5rem;
  }

  a:hover,
  a:focus-visible {
    article {
      background-color: var(--primary-bg);
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
