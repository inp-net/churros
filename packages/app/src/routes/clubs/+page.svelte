<script lang="ts">
  import { me } from '$lib/session';
  import type { PageData } from './$types';

  export let data: PageData;

  $: myGroups = new Map(
    $me?.groups.map((groupMember) => [groupMember.group.slug, groupMember]) ?? []
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
  {#each data.groups as { slug, name }}
    <tr>
      <td>{slug}</td>
      <td><a href="/club/{slug}/">{name}</a></td>
      {#if $me}
        <td>{myGroups.has(slug) ? 'Oui' : 'Non'}</td>
        <td>
          {#if $me.canEditGroups || myGroups.get(slug)?.canEditMembers}
            <a href="/club/{slug}/members/">Edit</a>
          {/if}
        </td>
      {/if}
    </tr>
  {/each}
</table>

{#if $me?.canEditGroups}
  <p><a href="create/">Créer un nouveau club</a></p>
{/if}
