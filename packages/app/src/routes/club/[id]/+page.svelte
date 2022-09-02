<script lang="ts">
  import { page } from '$app/stores';
  import Alert from '$lib/components/alerts/Alert.svelte';
  import SchoolBadge from '$lib/components/badges/SchoolBadge.svelte';
  import { me } from '$lib/session.js';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<h1>{data.group.name} <SchoolBadge schools={[data.group.school]} /></h1>

{#if data.group.members}
  <h2>Membres</h2>
  {#if data.group.members.length > 0}
    <table>
      {#each data.group.members as { member, president, treasurer, title }}
        <tr>
          <td>{president ? '👑' : ''}{treasurer ? '💰' : ''}</td>
          <td>
            <a href="/user/{member.uid}/">
              {member.firstName}
              {member.lastName}
            </a>
          </td>
          <td>{title}</td>
        </tr>
      {/each}
    </table>
  {:else}
    <Alert theme="warning">
      <p>Le group ne contient aucun membre, il vient peut-être d'être créé.</p>
    </Alert>
  {/if}
  {#if $me?.canEditGroups || $me?.groups.some(({ groupId, canEditMembers }) => canEditMembers && groupId === $page.params.id)}
    <p>
      <a href="/club/{$page.params.id}/members"> Modifier la liste des membres </a>
    </p>
  {/if}
{/if}

<h2>Articles</h2>

{#each data.group.articles as { title, bodyHtml }}
  <article>
    <h3>{title}</h3>
    {@html bodyHtml}
  </article>
{/each}

{#if $me?.canEditGroups || $me?.groups.some(({ groupId, canEditArticles }) => groupId === $page.params.id && canEditArticles)}
  <p>
    <a href="/club/{$page.params.id}/write"> Écrire un article </a>
  </p>
{/if}
