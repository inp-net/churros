<script lang="ts">
  import { me } from '$lib/session';
  import type { PageData } from './$types';

  export let data: PageData;

  $: myGroups = new Map($me?.groups.map((group) => [group.groupId, group]) ?? []);
</script>

<table>
  <tr>
    <td>#</td>
    <td>Nom</td>
    {#if $me}
      <td>Membre?</td>
      <td />
    {/if}
  </tr>
  {#each data.groups as { id, name }}
    <tr>
      <td>{id}</td>
      <td><a href="/club/{id}">{name}</a></td>
      {#if $me}
        <td>{myGroups.has(id) ? 'Oui' : 'Non'}</td>
        <td>
          {#if $me.canEditGroups || myGroups.get(id)?.canEditMembers}
            <a href="/club/{id}/members/">Edit</a>
          {/if}
        </td>
      {/if}
    </tr>
  {/each}
</table>

{#if $me?.canEditGroups}
  <p><a href="create/">Créer un nouveau club</a></p>
{/if}
