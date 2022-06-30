<script context="module" lang="ts">
  import { Query, query, type PropsType } from "$lib/zeus.js";

  import type { Load } from "@sveltejs/kit";

  const propsQuery = () =>
    Query({
      me: {
        firstname: true,
        lastname: true,
        nickname: true,
      },
    });

  type Props = PropsType<typeof propsQuery>;

  export const load: Load = async ({ fetch, session }) => ({
    props: query(fetch, propsQuery(), { token: session.token }),
  });
</script>

<script lang="ts">
  export let me: Props["me"];
</script>

<h1>
  {me.firstname}
  {#if me.nickname}<q>{me.nickname}</q>{/if}
  {me.lastname}
</h1>
