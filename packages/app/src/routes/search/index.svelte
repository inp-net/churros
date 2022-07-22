<script context="module" lang="ts">
  import { redirectToLogin } from '$lib/session';
  import { Query, query, type PropsType } from '$lib/zeus';
  import type { Load } from './__types';

  const propsQuery = (q: string) =>
    Query({ searchUsers: [{ q }, { id: true, firstname: true, lastname: true }] });

  type Props = PropsType<typeof propsQuery>;

  export const load: Load = async ({ fetch, session, url }) =>
    session.me
      ? {
          props: url.searchParams.has('q')
            ? await query(fetch, propsQuery(url.searchParams.get('q')!), session)
            : {},
        }
      : redirectToLogin(url.pathname + url.search);
</script>

<script lang="ts">
  import { goto } from '$app/navigation';

  export let searchUsers: Props['searchUsers'] | undefined;

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

{#if searchUsers === undefined}
  <p>Cherchez !</p>
{:else if searchUsers.length === 0}
  <p>Aucun résultat</p>
{:else}
  <ul>
    {#each searchUsers as { id, firstname, lastname }}
      <li><a href="/user/{id}/" sveltekit:prefetch>{firstname} {lastname}</a></li>
    {/each}
  </ul>
{/if}
