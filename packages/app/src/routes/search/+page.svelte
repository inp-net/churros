<script lang="ts">
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  export let data: PageData;

  let q = '';
</script>

<form
  method="get"
  on:submit|preventDefault={async () => goto(`?${new URLSearchParams({ q }).toString()}`)}
>
  <p>
    <input type="search" name="q" bind:value={q} />
    <button type="submit">🔍</button>
  </p>
</form>

{#if data.searchUsers === undefined}
  <p>Cherchez !</p>
{:else if data.searchUsers.length === 0}
  <p>Aucun résultat</p>
{:else}
  <ul>
    {#each data.searchUsers as { id, firstName, lastName }}
      <li><a href="/user/{id}/" sveltekit:prefetch>{firstName} {lastName}</a></li>
    {/each}
  </ul>
{/if}
