<script lang="ts">
  import { page } from '$app/stores';
  import IconSearch from '~icons/mdi/magnify';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import type { PageData } from './$types';
  import BaseInputText from '$lib/components/BaseInputText.svelte';

  export let data: PageData;

  let q = $page.url.searchParams.get('q') ?? '';
  const results = [...data.searchUsers, ...data.searchGroups, ...data.searchEvents];
</script>

<h1>Recherche</h1>

<form
  method="get"
  on:submit|preventDefault={() => {
    // goto does not re-trigger the page load function when submitting after the first load (see #1)
    // may be liked to the fact that we only change a query parameter
    // using this works (instead of goto())
    window.location.search = `?${new URLSearchParams({ q }).toString()}`;
  }}
>
  <BaseInputText type="text" placeholder="Personne, club, évènement, article,…" bind:value={q} />
  <ButtonGhost><IconSearch /></ButtonGhost>
</form>

{#if data.searchUsers === undefined || data.searchGroups === undefined}
  <p>Cherchez !</p>
{:else if results.length === 0}
  <p>Aucun résultat</p>
{:else}
  {#if data.searchUsers.length > 0}
    <h2>Personnes</h2>
    <ul class="nobullet">
      {#each data.searchUsers as { uid, firstName, lastName }}
        <li><a href="/user/{uid}/">{firstName} {lastName}</a></li>
      {/each}
    </ul>
  {/if}
  {#if data.searchGroups.length > 0}
    <h2>Groupes</h2>
    <ul class="nobullet">
      {#each data.searchGroups as { uid, name }}
        <li><a href="/club/{uid}/">{name}</a></li>
      {/each}
    </ul>
  {/if}
  {#if data.searchEvents.length > 0}
    <h2>Évènements</h2>
    <ul class="nobullet">
      {#each data.searchEvents as { group, uid, title }}
        <li><a href="/club/{group.uid}/event/{uid}">{title}</a></li>
      {/each}
    </ul>
  {/if}
{/if}

<style>
  h1 {
    margin-bottom: 2rem;
    text-align: center;
  }

  form {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
  }

  h2 {
    margin: 1rem;
  }
</style>
