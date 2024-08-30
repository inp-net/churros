<script lang="ts">
  import { pushState } from '$app/navigation';
  import { page } from '$app/stores';
  import BaseInputText from '$lib/components/BaseInputText.svelte';
  import CardGroup from '$lib/components/CardGroup.svelte';
  import CardPerson from '$lib/components/CardPerson.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { debugging } from '$lib/debugging';
  import IconSearch from '~icons/msl/search';
  import type { PageData } from './$houdini';
  import { cache } from '$houdini';

  export let data: PageData;
  $: ({ PageSearch } = data);

  $: initialQ = $page.params.q ?? '';
  let q = initialQ;

  const submitSearchQuery = async () => {
    cache.markStale('UserSearchResult');
    cache.markStale('GroupSearchResult');
    await PageSearch.fetch({ variables: { q } });
    pushState(`/search/${encodeURIComponent(q)}`, {});
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

<MaybeError result={$PageSearch} let:data>
  {@const results = [...data.searchUsers, ...data.searchGroups]}
  {#if !initialQ}
    <p class="empty">Pas de question, pas de réponse</p>
  {:else if results.length === 0}
    <p class="empty">Aucun résultat</p>
  {:else}
    {#if data.searchUsers.length > 0}
      <h2>Personnes</h2>
      <p class="typo-details results-count">
        {data.searchUsers.length} résultat{data.searchUsers.length > 1 ? 's' : ''}
      </p>
      <ul class="nobullet">
        {#each data.searchUsers as { user: { uid, ...rest }, rank, similarity }}
          <li data-rank={rank ?? 'null'} data-similarity={similarity}>
            {#if $debugging}
              <pre>rank {rank} <br />sim {similarity}</pre>
            {/if}
            <CardPerson href="/users/{uid}" {...rest} />
          </li>
        {/each}
      </ul>
    {/if}
    {#if data.searchGroups.length > 0}
      <h2>Groupes</h2>
      <p class="typo-details results-count">
        {data.searchGroups.length} résultat{data.searchGroups.length > 1 ? 's' : ''}
      </p>
      <ul class="nobullet">
        {#each data.searchGroups as { group: { uid, ...rest }, rank, similarity }}
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
</MaybeError>

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
