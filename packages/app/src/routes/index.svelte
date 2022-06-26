<script context="module" lang="ts">
  import type { Load } from "@sveltejs/kit";
  import { Chain } from "../zeus/index.js";

  export const load: Load = () => {
    const chain = Chain("http://localhost:4000/graphql");

    return {
      props: chain("query")({
        homepage: [
          {},
          {
            title: true,
            body: true,
            club: { name: true },
            author: { name: true },
          },
        ],
      }),
    };
  };
</script>

<script lang="ts">
  export let homepage: unknown;
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>

<pre>{JSON.stringify(homepage, null, 2)}</pre>
