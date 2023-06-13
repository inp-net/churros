<script lang="ts">
  import { goto } from '$app/navigation';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$types';
  import EventSearch from './EventSearch.svelte';
  import { page } from '$app/stores';
  import { me } from '$lib/session';

  export let data: PageData;

  let title = '';
  let body = '';
  let eventId: string | undefined;

  const createArticle = async () => {
    try {
      await $zeus.mutate({
        upsertArticle: [
          {
            title,
            body,
            groupId: data.group.id,
            authorId: $me?.id,
            links: [],
            published: false,
            eventId
          },
          { id: true }
        ]
      });
      await goto('..');
    } catch (error: unknown) {
      console.error(error);
    }
  };
</script>

<form on:submit|preventDefault={createArticle}>
  <p><EventSearch groupUid={$page.params.group} bind:eventId /></p>
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
