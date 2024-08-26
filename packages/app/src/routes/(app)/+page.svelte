<script lang="ts">
  import { PendingValue } from '$houdini';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import CardArticle from '$lib/components/CardArticle.houdini.svelte';
  import InputSelectOneDropdown from '$lib/components/InputSelectOneDropdown.svelte';
  import QuickAccessList from '$lib/components/QuickAccessList.svelte';
  import { loaded, type MaybeLoading } from '$lib/loading';
  import { isMobile } from '$lib/mobile';
  import { infinitescroll } from '$lib/scroll';
  import { notNull } from '$lib/typing';
  import type { PageData } from './$houdini';

  const mobile = isMobile();

  export let data: PageData;
  $: ({ PageHomeFeed, Birthdays, AppLayout } = data);

  let defaultBirthdaysSection: MaybeLoading<string> = PendingValue;
  let selectedBirthdaysYearTier: string | undefined = undefined;

  $: shownBirthdays =
    $Birthdays.data?.birthdays.filter(
      (u) =>
        selectedBirthdaysYearTier === undefined ||
        selectedBirthdaysYearTier === 'all' ||
        u.yearTier === Number.parseFloat(selectedBirthdaysYearTier),
    ) ?? [];

  $: if (loaded(defaultBirthdaysSection) && !selectedBirthdaysYearTier)
    selectedBirthdaysYearTier = defaultBirthdaysSection;

  $: {
    const yearTier = $Birthdays.data?.me?.yearTier;
    defaultBirthdaysSection = yearTier ? (yearTier <= 3 ? yearTier.toString() : 'all') : 'all';
  }
</script>

{#if mobile}
  <QuickAccessList pins={$AppLayout?.data?.me ?? null} />
{/if}

{#if $Birthdays.data}
  <section class="birthdays">
    <h2>
      Anniversaires
      <InputSelectOneDropdown
        bind:value={selectedBirthdaysYearTier}
        label=""
        options={{ 1: '1As', 2: '2As', 3: '3As', all: 'Tous' }}
      />
      <ButtonSecondary href="/birthdays">Autres jours</ButtonSecondary>
    </h2>
    <ul class="nobullet">
      {#each shownBirthdays as { uid, major, birthday, ...user } (uid)}
        <li>
          <AvatarPerson
            href="/users/{uid}"
            {...user}
            role="{major?.shortName ?? '(exté)'} · {new Date().getFullYear() -
              (birthday?.getFullYear() ?? 0)} ans"
          />
        </li>
      {:else}
        <li>
          {#if selectedBirthdaysYearTier === 'all'}
            Personne n'est né aujourd'hui :/
          {:else}
            Aucun·e {selectedBirthdaysYearTier}A n'est né·e aujourd'hui :/
          {/if}
        </li>
      {/each}
    </ul>
  </section>
{/if}

<section class="articles" use:infinitescroll={async () => await PageHomeFeed.loadNextPage()}>
  {#each $PageHomeFeed.data?.homepage?.edges.filter(notNull) ?? [] as { node: article }}
    <CardArticle {article} />
  {/each}
  <div class="scroll-end">
    {#if $PageHomeFeed.pageInfo.hasNextPage}
      <CardArticle article={null} />
    {:else}
      <p class="no-more-posts">Plus de posts à afficher!</p>
      <!-- TODO défi d'inté??? -->
    {/if}
  </div>
</section>

<style>
  section.articles {
    display: flex;
    flex-direction: column;
    row-gap: 2rem;
    max-width: 600px;
    margin: 2rem auto 0;
  }

  section.articles .no-more-posts {
    margin-top: 1rem;
    text-align: center;
  }

  section.birthdays h2 {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: center;
  }

  section.birthdays ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    justify-content: center;
    margin-top: 1rem;
  }

  section.birthdays {
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    max-width: 600px;
    margin: 0 auto;
  }
</style>
