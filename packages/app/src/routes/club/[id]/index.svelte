<script context="module" lang="ts">
  import { page, session } from "$app/stores";
  import { query, Selector, type PropsType } from "$lib/zeus";
  import type { Load } from "@sveltejs/kit";

  const propsQuery = (id: string) =>
    Selector("Query")({
      club: [
        { id },
        { id: true, name: true, articles: { title: true, body: true } },
      ],
    });

  type Props = PropsType<typeof propsQuery>;

  export const load: Load = async ({ fetch, params, session }) => {
    try {
      return {
        props: await query(fetch, propsQuery(params.id), {
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

{#each club.articles as { title, body }}
  <article>
    <h2>{title}</h2>
    <Markdown {body} />
  </article>
{/each}

{#if $session.me?.clubs.some(({ clubId, canPostArticles }) => clubId === $page.params.id && canPostArticles)}
  <p><a href="/club/{$page.params.id}/write">Écrire un article</a></p>
{/if}
