<script context="module" lang="ts">
  import { session } from "$app/stores";
  import { mutate, query, Query, type PropsType } from "$lib/zeus.js";
  import type { Load } from "@sveltejs/kit";

  const propsQuery = (id: string) =>
    Query({
      user: [
        { id },
        { id: true, firstname: true, lastname: true, nickname: true },
      ],
    });

  type Props = PropsType<typeof propsQuery>;

  export const load: Load = async ({ fetch, params, session }) =>
    params.id === session.me?.id || session.me?.canEditUsers
      ? { props: query(fetch, propsQuery(params.id), session) }
      : { status: 307, redirect: "." };
</script>

<script lang="ts">
  export let user: Props["user"];

  let nickname = user.nickname;

  const updateUser = async () => {
    const { updateUser } = await mutate(
      {
        updateUser: [
          { id: user.id, nickname },
          { id: true, firstname: true, lastname: true, nickname: true },
        ],
      },
      $session
    );
    user = updateUser;
  };
</script>

<h1>Éditer {user.firstname} {user.nickname} {user.lastname}</h1>
<form on:submit|preventDefault={updateUser}>
  <p>
    <label>Surnom : <input type="text" bind:value={nickname} /></label>
  </p>
  <p>
    <button>Sauvegarder</button>
  </p>
</form>
