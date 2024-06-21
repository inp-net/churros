<script lang="ts">
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import CardArticle from '$lib/components/CardArticle.houdini.svelte';
  import CarouselGroups from '$lib/components/CarouselGroups.svelte';
  import InputSelectOne from '$lib/components/InputSelectOne.svelte';
  import { infinitescroll } from '$lib/scroll';
  import { notNull } from '$lib/typing';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageHomeFeed, Birthdays, MyGroups } = data);

  let selectedBirthdaysYearTier = 'all';

  $: shownBirthdays =
    $Birthdays.data?.birthdays.filter(
      (u) =>
        selectedBirthdaysYearTier === 'all' ||
        u.yearTier === Number.parseFloat(selectedBirthdaysYearTier),
    ) ?? [];

  $: {
    const yearTier = $Birthdays.data?.me?.yearTier;
    selectedBirthdaysYearTier = yearTier ? (yearTier <= 3 ? yearTier.toString() : 'all') : 'all';
  }
</script>

<h1>Mon feed</h1>

{#if $MyGroups.data?.me}
  <section class="groups">
    <CarouselGroups groups={$MyGroups.data.me.groups.map(({ group }) => group) ?? []} />
  </section>
{/if}

{#if $Birthdays.data}
  <section class="birthdays">
    <h2>
      Anniversaires
      <InputSelectOne
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
  {#each $PageHomeFeed.data?.homepage?.edges.filter(notNull) ?? [] as { node: article } (article.id)}
    <CardArticle {article} href="/posts/{article.group.uid}/{article.uid}/" />
  {/each}
  <div class="scroll-end">
    {#if $PageHomeFeed.pageInfo.hasNextPage}
      Chargement...
    {:else}
      Plus de posts à afficher!
      <!-- TODO défi d'inté??? -->
    {/if}
  </div>
</section>

<style>
  h1 {
    margin-bottom: 1rem;
    text-align: center;
  }

  section.groups {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
  }

  section.articles {
    display: flex;
    flex-direction: column;
    row-gap: 2rem;
    max-width: 600px;
    margin: 2rem auto 0;
  }

  section.articles .scroll-end {
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
