<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { zeus } from '$lib/zeus';

  let title = '';
  let body = '';

  const createArticle = async () => {
    try {
      await $zeus.mutate({
        createArticle: [{ title, body, groupId: $page.params.id }, { id: true }],
      });
      await goto('..');
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
