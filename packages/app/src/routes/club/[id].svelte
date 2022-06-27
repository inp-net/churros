<script context="module" lang="ts">
  import {
    query,
    Selector,
    type GraphQLTypes,
    type InputType,
  } from "$lib/zeus";
  import type { Load } from "@sveltejs/kit";

  const propsQuery = (id: string) =>
    Selector("Query")({
      club: [
        { id },
        { id: true, name: true, articles: { title: true, body: true } },
      ],
    });

  type Props = InputType<GraphQLTypes["Query"], ReturnType<typeof propsQuery>>;

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
  export let club: Props["club"];
</script>

<h1>{club.name}</h1>

{#each club.articles as { title, body }}
  <article>
    <h2>{title}</h2>
    <p>{body}</p>
  </article>
{/each}
