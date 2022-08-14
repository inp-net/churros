<script context="module" lang="ts">
  import { session } from '$app/stores';
  import { GroupType, query, Query, type PropsType } from '$lib/zeus';
  import type { Load } from './__types';

  const propsQuery = () =>
    Query({
      groups: [{ types: [GroupType.Association, GroupType.Club] }, { id: true, name: true }],
    });

  type Props = PropsType<typeof propsQuery>;

  export const load: Load = async ({ fetch, session }) => ({
    props: await query(fetch, propsQuery(), session),
  });
</script>

<script lang="ts">
  export let groups: Props['groups'];

  $: myGroups = new Map($session.me?.groups.map((group) => [group.groupId, group]) ?? []);
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
  {#each groups as { id, name }}
    <tr>
      <td>{id}</td>
      <td><a href="/club/{id}" sveltekit:prefetch>{name}</a></td>
      {#if $session.me}
        <td>{myGroups.has(id) ? 'Oui' : 'Non'}</td>
        <td>
          {#if $session.me.canEditGroups || myGroups.get(id)?.canEditMembers}
            <a href="/club/{id}/members/" sveltekit:prefetch>Edit</a>
          {/if}
        </td>
      {/if}
    </tr>
  {/each}
</table>

{#if $session.me?.canEditGroups}
  <p><a href="create/">Créer un nouveau club</a></p>
{/if}
