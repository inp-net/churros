<script lang="ts">
  import CardArticle from '$lib/components/CardArticle.svelte';
  import type { PageData } from './$houdini';
  import { env } from '$env/dynamic/public';
  import CarouselGroups from '$lib/components/CarouselGroups.svelte';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import InputSelectOne from '$lib/components/InputSelectOne.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { onMount } from 'svelte';
  import { PendingValue } from '$houdini';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  export let data: PageData;
  $: ({ HomeQuery } = data);

  let selectedBirthdaysYearTier = 'all';
  onMount(async () => {
    const yearTier = $HomeQuery.data?.me?.yearTier;
    selectedBirthdaysYearTier = yearTier ? (yearTier <= 3 ? yearTier.toString() : 'all') : 'all';
  });
</script>

<!--{@debug $IndexQuery.data}-->

<h1>Mon feed</h1>

<!--<p>{$IndexQuery.data}</p>-->

<section class="groups">
  {#if $HomeQuery?.data?.me?.groups}
    <CarouselGroups groups={$HomeQuery?.data?.me?.groups?.map((g) => g.group)} />
  {/if}
</section>

{#if $HomeQuery.fetching}
  <LoadingSpinner></LoadingSpinner>
{:else}
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
      {#each $HomeQuery.data?.birthdays?.filter((u) => selectedBirthdaysYearTier === 'all' || u.yearTier === Number.parseFloat(selectedBirthdaysYearTier)) ?? [] as { uid, major, birthday, ...user } (uid)}
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

  <section class="articles">
    {#each $HomeQuery.data?.homepage.edges ?? [] as edge (edge?.node.id)}
      {#if edge?.node}
        {@const { id, uid, pictureFile, group, reactionCounts, myReactions, event, ...rest } =
          edge.node}
        <CardArticle
          {...rest}
          {id}
          {group}
          likes={reactionCounts['❤️'] ?? 0}
          liked={myReactions['❤️']}
          event={event ? { href: `/events/${event.group.uid}/${event.uid}`, ...event } : undefined}
          href="/posts/{group.uid}/{uid}/"
          img={pictureFile ? { src: `${env.PUBLIC_STORAGE_URL}${pictureFile}` } : undefined}
        />
      {/if}
    {/each}
  </section>
{/if}

{#if $HomeQuery.pageInfo.hasNextPage}
  <section class="see-more">
    <ButtonSecondary on:click={() => HomeQuery.loadNextPage()}>Voir plus</ButtonSecondary>
  </section>
{/if}

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

  .see-more {
    display: flex;
    justify-content: center;
  }
</style>
