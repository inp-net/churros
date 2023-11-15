<script lang="ts">
  import { page } from '$app/stores';
  import IconSearch from '~icons/mdi/magnify';
  import type { PageData } from './$types';
  import BaseInputText from '$lib/components/BaseInputText.svelte';
  import CardGroup from '$lib/components/CardGroup.svelte';
  import CardPerson from '$lib/components/CardPerson.svelte';
  import { goto } from '$app/navigation';

  export let data: PageData;

  $: initialQ = $page.params.q ?? '';
  let q = initialQ;
  const similarityCutoff = $page.url.searchParams.get('sim') ?? 0.05;

  $: results = [...data.searchUsers, ...data.searchGroups];

  const submitSearchQuery = async () => {
    await goto(
      `/search/${encodeURIComponent(q)}` +
        (similarityCutoff === 0.05 ? '' : `?sim=${similarityCutoff}`),
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
{:else if results.length === 0}
  <p class="empty">Aucun résultat</p>
{:else}
  {#if data.searchUsers.length > 0}
    <h2>Personnes</h2>
    <p class="typo-details results-count">
      {data.searchUsers.length} résultat{data.searchUsers.length > 1 ? 's' : ''}
    </p>
    <ul class="nobullet">
      {#each data.searchUsers as { uid, ...rest }}
        <li>
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
      {#each data.searchGroups as { uid, ...rest }}
        <li>
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
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }

  // ul.events li {
  //   max-width: 300px;
  // }

  .empty {
    text-align: center;
  }
</style>
