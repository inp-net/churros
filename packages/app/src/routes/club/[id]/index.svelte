<script context="module" lang="ts">
  import { page, session } from "$app/stores";
  import { query, Selector, type PropsType } from "$lib/zeus";
  import type { Load } from "@sveltejs/kit";

  const propsQuery = (id: string, loggedIn: boolean) =>
    Selector("Query")({
      club: [
        { id },
        loggedIn
          ? {
              id: true,
              name: true,
              articles: { title: true, body: true },
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
              articles: { title: true, body: true },
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
  import Markdown from "$lib/Markdown.svelte";

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
  {#if $session.me?.clubs.some(({ clubId, canAddMembers }) => clubId === $page.params.id && canAddMembers)}
    <p>
      <a href="/club/{$page.params.id}/members">
        Modifier la liste des membres
      </a>
    </p>
  {/if}
{/if}

<h2>Articles</h2>

{#each club.articles as { title, body }}
  <article>
    <h3>{title}</h3>
    <Markdown {body} />
  </article>
{/each}

{#if $session.me?.clubs.some(({ clubId, canPostArticles }) => clubId === $page.params.id && canPostArticles)}
  <p><a href="/club/{$page.params.id}/write">Écrire un article</a></p>
{/if}
