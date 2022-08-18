<script lang="ts">
  import { session } from '$app/stores';
  import type { PageData } from './$types';

  export let data: PageData;

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
  {#each data.groups as { id, name }}
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
