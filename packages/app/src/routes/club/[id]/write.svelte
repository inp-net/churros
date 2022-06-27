<script context="module" lang="ts">
  export const load: Load = async ({ session, url, params }) => {
    if (!session.me) {
      return {
        status: 307,
        redirect: `/login?${new URLSearchParams({ then: url.pathname })}`,
      };
    }

    if (
      !session.me.clubs.some(
        ({ clubId, canPostArticles }) => clubId === params.id && canPostArticles
      )
    ) {
      return { status: 307, redirect: "." };
    }

    return {};
  };
</script>

<script lang="ts">
  import { goto } from "$app/navigation";
  import { session, page } from "$app/stores";
  import { mutate } from "$lib/zeus";
  import type { Load } from "@sveltejs/kit";

  let title = "";
  let body = "";

  const createArticle = async () => {
    try {
      await mutate(
        fetch,
        {
          createArticle: [
            { title, body, clubId: $page.params.id },
            { id: true },
          ],
        },
        { token: $session.token }
      );
      await goto(".");
    } catch (error) {
      console.error(error);
    }
  };
</script>

<form on:submit|preventDefault={createArticle}>
  <p>
    <label>
      Titre :
      <input type="text" bind:value={title} />
    </label>
  </p>
  <p>
    <textarea bind:value={body} cols="80" rows="10" />
  </p>
  <p><button type="submit">Créer l'article</button></p>
</form>
