<script lang="ts">
  import { me } from '$lib/session';
  import type { PageData } from './$types';

  export let data: PageData;

  $: myGroups = new Map(
    $me?.groups.map((groupMember) => [groupMember.group.uid, groupMember]) ?? []
  );
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
  {#each data.groups as { uid, name }}
    <tr>
      <td>{uid}</td>
      <td><a href="/club/{uid}/">{name}</a></td>
      {#if $me}
        <td>{myGroups.has(uid) ? 'Oui' : 'Non'}</td>
        <td>
          {#if $me.canEditGroups || myGroups.get(uid)?.canEditMembers}
            <a href="/club/{uid}/members/">Edit</a>
          {/if}
        </td>
      {/if}
    </tr>
  {/each}
</table>

{#if $me?.canEditGroups}
  <p><a href="create/">Créer un nouveau club</a></p>
{/if}
