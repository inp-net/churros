<script context="module" lang="ts">
  import { session } from '$app/stores'
  import { query, Query, type PropsType } from '$lib/zeus'
  import type { Load } from '@sveltejs/kit'

  const propsQuery = () =>
    Query({
      clubs: { id: true, name: true },
    })

  type Props = PropsType<typeof propsQuery>

  export const load: Load = async ({ fetch, session }) => ({
    props: await query(fetch, propsQuery(), session),
  })
</script>

<script lang="ts">
  export let clubs: Props['clubs']

  $: myClubs = new Map($session.me?.clubs.map((club) => [club.clubId, club]) ?? [])
</script>

<table>
  <tr>
    <td>#</td>
    <td>Nom</td>
    {#if $session.me}
      <td>Membre?</td>
      <td />
    {/if}
  </tr>
  {#each clubs as { id, name }}
    <tr>
      <td>{id}</td>
      <td><a href="/club/{id}" sveltekit:prefetch>{name}</a></td>
      {#if $session.me}
        <td>{myClubs.has(id) ? 'Oui' : 'Non'}</td>
        <td>
          {#if $session.me.canEditClubs || myClubs.get(id)?.canEditMembers}
            <a href="/club/{id}/members/" sveltekit:prefetch>Edit</a>
          {/if}
        </td>
      {/if}
    </tr>
  {/each}
</table>
