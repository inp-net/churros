<script context="module" lang="ts">
  import { goto } from '$app/navigation';
  import { page, session } from '$app/stores';
  import { redirectToLogin } from '$lib/session';
  import { mutate } from '$lib/zeus';
  import type { Load } from './__types/write';

  export const load: Load = ({ session, url, params }) => {
    if (!session.me) return redirectToLogin(url.pathname);

    if (
      !session.me.canEditClubs &&
      !session.me.clubs.some(
        ({ clubId, canEditArticles }) => clubId === params.id && canEditArticles
      )
    )
      return { status: 307, redirect: '.' };

    return {};
  };
</script>

<script lang="ts">
  let title = '';
  let body = '';

  const createArticle = async () => {
    try {
      await mutate(
        {
          createArticle: [{ title, body, clubId: $page.params.id }, { id: true }],
        },
        $session
      );
      await goto('.');
    } catch (error: unknown) {
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
