<script context="module" lang="ts">
  import {
    query,
    Selector,
    type GraphQLTypes,
    type InputType,
  } from "$lib/zeus";
  import type { Load } from "@sveltejs/kit";

  const propsQuery = () =>
    Selector("Query")({
      homepage: [
        {},
        {
          title: true,
          body: true,
          publishedAt: true,
          club: { id: true, name: true },
          author: { firstname: true, lastname: true },
        },
      ],
    });

  type Props = InputType<GraphQLTypes["Query"], ReturnType<typeof propsQuery>>;

  export const load: Load = async ({ fetch, session }) => {
    return {
      props: await query(fetch, propsQuery(), { token: session.token }),
    };
  };
</script>

<script lang="ts">
  import Markdown from "$lib/Markdown.svelte";

  export let homepage: Props["homepage"];
</script>

<h1>Welcome to Centraverse</h1>

{#each homepage as { title, body, publishedAt, club, author }}
  <article>
    <h2>{title}</h2>
    <p>Par <a href="/club/{club.id}">{club.name}</a> le {publishedAt}</p>
    <Markdown {body} />
    {#if author}
      <p><em>Auteur : {author.firstname} {author.lastname}</em></p>
    {/if}
  </article>
{/each}
