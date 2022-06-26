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
          club: { name: true },
          author: { name: true },
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
  export let homepage: Props["homepage"];
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>

<pre>{JSON.stringify(homepage, null, 2)}</pre>
