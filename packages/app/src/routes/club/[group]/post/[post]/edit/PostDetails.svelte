<script lang="ts">
  import Alert from '$lib/components/alerts/Alert.svelte';
  import { zeus } from '$lib/zeus';
  import type { PageData } from '../$types';
  import Button from '$lib/components/buttons/Button.svelte';
  import { goto } from '$app/navigation';
  import EventSearch from '../../../write/EventSearch.svelte';
  import { page } from '$app/stores';
  import { _articleQuery } from './+page';
  import FormInput from '$lib/components/inputs/FormInput.svelte';
  import LinkCollectionInput from '$lib/components/inputs/LinkCollectionInput.svelte';
  import { formatDatetimeLocal } from '$lib/dates';

  export let data: PageData;

  let serverError = '';

  let { id, event, eventId, title, author, body, publishedAt, links, group } = data.article;

  $: console.log(publishedAt);

  let loading = false;
  const updateArticle = async () => {
    if (loading) return;
    try {
      loading = true;
      const { upsertArticle } = await $zeus.mutate({
        upsertArticle: [
          {
            id,
            authorId: author?.id,
            eventId: event?.id,
            groupId: group.id,
            title,
            body,
            publishedAt: publishedAt?.toISOString(),
            links,
          },
          {
            __typename: true,
            '...on Error': { message: true },
            '...on MutationUpsertArticleSuccess': {
              data: _articleQuery,
            },
          },
        ],
      });

      if (upsertArticle.__typename === 'Error') {
        serverError = upsertArticle.message;
        return;
      }

      serverError = '';
      data.article = upsertArticle.data;
      ({ id, event, eventId, title, author, body, publishedAt, links, group } = data.article);
      if (data.article.uid)
        await goto(`/club/${data.article.group.uid}/post/${data.article.uid}/edit`);
    } finally {
      loading = false;
    }
  };
</script>

<form on:submit|preventDefault={updateArticle}>
  <EventSearch groupUid={$page.params.group} bind:eventId />
  <FormInput label="Titre">
    <input type="text" required bind:value={title} />
  </FormInput>
  <FormInput label="Publier le">
    <input
      type="datetime-local"
      value={publishedAt ? formatDatetimeLocal(publishedAt) : ''}
      on:input={({ target: { value } }) => {
        publishedAt = new Date(Date.parse(value));
      }}
    />
  </FormInput>
  <FormInput label="Description">
    <textarea bind:value={body} cols="30" rows="10" />
  </FormInput>
  <p>Liens:</p>
  <LinkCollectionInput bind:value={links} />
  {#if serverError}
    <Alert theme="danger"
      >Impossible de sauvegarder les modifications : <br /><strong>{serverError}</strong></Alert
    >
  {/if}
  <Button theme="primary" {loading} type="submit">Enregistrer</Button>
</form>
