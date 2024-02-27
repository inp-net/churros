<script lang="ts">
  import { page } from '$app/stores';
  import IconSearch from '~icons/mdi/magnify';
  import type { PageData } from './$houdini';
  import BaseInputText from '$lib/components/BaseInputText.svelte';
  import CardGroup from '$lib/components/CardGroup.svelte';
  import CardPerson from '$lib/components/CardPerson.svelte';
  import { goto } from '$app/navigation';
  import { debugging } from '$lib/debugging';

  export let data: PageData;
  $: ({ SearchResults } = data);
  $: ({ searchUsers, searchGroups } = $SearchResults.data ?? {
    searchGroups: [],
    searchUsers: [],
  });
  $: totalResultsCount = searchUsers.length + searchGroups.length;

  $: initialQ = $page.params.q ?? '';
  let q = initialQ;
  const similarityCutoff = $page.url.searchParams.get('sim') ?? undefined;

  const submitSearchQuery = async () => {
    await goto(
      `/search/${encodeURIComponent(q)}` + (similarityCutoff ? `?sim=${similarityCutoff}` : ''),
    );
  };
</script>

<form class="query" method="get" on:submit|preventDefault={submitSearchQuery}>
  <h1>Recherche</h1>
  <BaseInputText
    actionIcon={IconSearch}
    on:action={submitSearchQuery}
    type="text"
    placeholder="Personne, club, évènement, post,…"
    bind:value={q}
    autofocus
  />
</form>

{#if !initialQ}
  <p class="empty">Pas de question, pas de réponse</p>
{:else if totalResultsCount === 0}
  <p class="empty">Aucun résultat</p>
{:else}
  {#if searchUsers.length > 0}
    <h2>Personnes</h2>
    <p class="typo-details results-count">
      {searchUsers.length} résultat{searchUsers.length > 1 ? 's' : ''}
    </p>
    <ul class="nobullet">
      {#each searchUsers as { user: { uid, ...rest }, rank, similarity }}
        <li data-rank={rank ?? 'null'} data-similarity={similarity}>
          {#if $debugging}
            <pre>rank {rank} <br />sim {similarity}</pre>
          {/if}
          <CardPerson href="/users/{uid}" {...rest} />
        </li>
      {/each}
    </ul>
  {/if}
  {#if searchGroups.length > 0}
    <h2>Groupes</h2>
    <p class="typo-details results-count">
      {searchGroups.length} résultat{searchGroups.length > 1 ? 's' : ''}
    </p>
    <ul class="nobullet">
      {#each searchGroups as { group: { uid, ...rest }, rank, similarity }}
        <li data-rank={rank ?? 'null'} data-similarity={similarity}>
          {#if $debugging}
            <pre>rank {rank} <br />sim {similarity}</pre>
          {/if}
          <CardGroup href="/groups/{uid}" {...rest} />
        </li>
      {/each}
    </ul>
  {/if}
{/if}

<style lang="scss">
  form.query {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    max-width: 1000px;
    margin: 0 auto;
    margin-bottom: 2rem;

    > :global(.base-input) {
      width: 100%;
    }
  }

  h2 {
    margin: 1rem;
    margin-bottom: 0;
    text-align: center;
  }

  h2 + .results-count {
    margin-bottom: 1rem;
    font-weight: normal;
    text-align: center;
  }

  ul {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
    gap: 1rem;
    place-content: center center;
    place-items: center center;
  }

  // ul.events li {
  //   max-width: 300px;
  // }

  .empty {
    text-align: center;
  }
</style>
