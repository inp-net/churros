<script context="module" lang="ts">
  import { page, session } from '$app/stores';
  import { query, Query, type PropsType } from '$lib/zeus';
  import type { Load } from './__types';

  const propsQuery = (id: string, loggedIn: boolean) =>
    Query({
      group: [
        { id },
        loggedIn
          ? {
              id: true,
              name: true,
              articles: { title: true, bodyHtml: true },
              members: {
                member: { id: true, firstname: true, lastname: true },
                title: true,
                president: true,
                treasurer: true,
              },
              school: { name: true },
            }
          : {
              id: true,
              name: true,
              articles: { title: true, bodyHtml: true },
              school: { name: true },
            },
      ],
    });

  type Props = PropsType<typeof propsQuery>;

  export const load: Load = async ({ fetch, params, session }) => ({
    props: await query(fetch, propsQuery(params.id, Boolean(session.me)), session),
  });
</script>

<script lang="ts">
  import Alert from '$lib/components/alerts/Alert.svelte';

  export let group: Props['group'];
</script>

<h1>{group.name} ({group.school.name})</h1>

{#if group.members}
  <h2>Membres</h2>
  {#if group.members.length > 0}
    <table>
      {#each group.members as { member, president, treasurer, title }}
        <tr>
          <td>{president ? '👑' : ''}{treasurer ? '💰' : ''}</td>
          <td>
            <a href="/user/{member.id}" sveltekit:prefetch>
              {member.firstname}
              {member.lastname}
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
  {#if $session.me?.canEditGroups || $session.me?.groups.some(({ groupId, canEditMembers }) => canEditMembers && groupId === $page.params.id)}
    <p>
      <a href="/club/{$page.params.id}/members" sveltekit:prefetch>
        Modifier la liste des membres
      </a>
    </p>
  {/if}
{/if}

<h2>Articles</h2>

{#each group.articles as { title, bodyHtml }}
  <article>
    <h3>{title}</h3>
    {@html bodyHtml}
  </article>
{/each}

{#if $session.me?.canEditGroups || $session.me?.groups.some(({ groupId, canEditArticles }) => groupId === $page.params.id && canEditArticles)}
  <p>
    <a href="/club/{$page.params.id}/write" sveltekit:prefetch> Écrire un article </a>
  </p>
{/if}
