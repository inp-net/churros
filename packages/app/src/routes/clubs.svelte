<script context="module" lang="ts">
  import { query, Query, type PropsType } from "$lib/zeus";
  import type { Load } from "@sveltejs/kit";

  const propsQuery = () =>
    Query({
      clubs: { id: true, name: true },
    });

  type Props = PropsType<typeof propsQuery>;

  export const load: Load = async ({ fetch, session }) => ({
    props: await query(fetch, propsQuery(), { token: session.token }),
  });
</script>

<script lang="ts">
  export let clubs: Props["clubs"];
</script>

<table>
  {#each clubs as { id, name }}
    <tr>
      <td>{id}</td>
      <td><a href="/club/{id}">{name}</a></td>
    </tr>
  {/each}
</table>
