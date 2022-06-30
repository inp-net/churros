<script context="module" lang="ts">
  import { page, session } from "$app/stores";
  import { query, Query, type PropsType } from "$lib/zeus";
  import type { Load } from "@sveltejs/kit";

  const propsQuery = (id: string, loggedIn: boolean) =>
    Query({
      club: [
        { id },
        loggedIn
          ? {
              id: true,
              name: true,
              articles: { title: true, bodyHtml: true },
              members: {
                member: { firstname: true, lastname: true },
                title: true,
                president: true,
                treasurer: true,
              },
            }
          : {
              id: true,
              name: true,
              articles: { title: true, bodyHtml: true },
            },
      ],
    });

  type Props = PropsType<typeof propsQuery>;

  export const load: Load = async ({ fetch, params, session }) => {
    try {
      return {
        props: await query(fetch, propsQuery(params.id, Boolean(session.me)), {
          token: session.token,
        }),
      };
    } catch {
      return { status: 404 };
    }
  };
</script>

<script lang="ts">
  export let club: Props["club"];
</script>

<h1>{club.name}</h1>

{#if club.members}
  <h2>Membres</h2>
  <table>
    {#each club.members as { member, president, treasurer, title }}
      <tr>
        <td>{president ? "👑" : ""}{treasurer ? "💰" : ""}</td>
        <td>{member.firstname} {member.lastname}</td>
        <td>{title}</td>
      </tr>
    {/each}
  </table>
  {#if $session.me?.clubs.some(({ clubId, canEditMembers }) => clubId === $page.params.id && canEditMembers)}
    <p>
      <a href="/club/{$page.params.id}/members">
        Modifier la liste des membres
      </a>
    </p>
  {/if}
{/if}

<h2>Articles</h2>

{#each club.articles as { title, bodyHtml }}
  <article>
    <h3>{title}</h3>
    {@html bodyHtml}
  </article>
{/each}

{#if $session.me?.canEditClubs || $session.me?.clubs.some(({ clubId, canEditArticles }) => clubId === $page.params.id && canEditArticles)}
  <p><a href="/club/{$page.params.id}/write">Écrire un article</a></p>
{/if}
