<script context="module" lang="ts">
  export const load: Load = async ({ session, url, params }) => {
    if (!session.me) {
      return redirectToLogin(url.pathname);
    }

    if (
      !session.me.canEditClubs &&
      !session.me.clubs.some(
        ({ clubId, canEditArticles }) => clubId === params.id && canEditArticles
      )
    ) {
      return { status: 307, redirect: "." };
    }

    return {};
  };
</script>

<script lang="ts">
  import { goto } from "$app/navigation";
  import { page, session } from "$app/stores";
  import { redirectToLogin } from "$lib/session.js";
  import { mutate } from "$lib/zeus";
  import type { Load } from "@sveltejs/kit";

  let title = "";
  let body = "";

  const createArticle = async () => {
    try {
      await mutate(
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
