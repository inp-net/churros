<script lang="ts">
  import Alert from '$lib/components/Alert.svelte';
  import { zeus } from '$lib/zeus';
  import type { PageData } from '../../routes/club/[group]/post/[post]/edit/$types';
  import Button from '$lib/components/Button.svelte';
  import { goto } from '$app/navigation';
  import EventSearch from './InputEvent.svelte';
  import { page } from '$app/stores';
  import { _articleQuery } from '../../routes/club/[group]/post/[post]/edit/+page';
  import LinkCollectionInput from '$lib/components/InputLinks.svelte';
  import DateInput from '$lib/components/InputDate.svelte';
  import { DISPLAY_VISIBILITIES, HELP_VISIBILITY } from '$lib/display';
  import InputField from '$lib/components/InputField.svelte';
  import InputSelectOne from './InputSelectOne.svelte';

  export let data: PageData;

  let serverError = '';

  let { id, event, eventId, title, author, body, publishedAt, visibility, links, group } =
    data.article;

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
            authorId: author?.id ?? '',
            eventId: event?.id,
            groupId: group.id,
            title,
            body,
            publishedAt: publishedAt?.toISOString(),
            links,
            visibility,
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
  <InputField label="Titre">
    <input type="text" required bind:value={title} />
  </InputField>
  <InputField label="Publier le">
    <DateInput bind:value={publishedAt} />
  </InputField>
  <InputSelectOne
    required
    options={DISPLAY_VISIBILITIES}
    bind:value={visibility}
    label="Visibilité"
    hint={HELP_VISIBILITY[visibility]}
  />
  <InputField label="Description">
    <textarea bind:value={body} cols="30" rows="10" />
  </InputField>
  <p>Liens:</p>
  <LinkCollectionInput bind:value={links} />
  {#if serverError}
    <Alert theme="danger"
      >Impossible de sauvegarder les modifications : <br /><strong>{serverError}</strong></Alert
    >
  {/if}
  <Button theme="primary" {loading} type="submit">Enregistrer</Button>
</form>
