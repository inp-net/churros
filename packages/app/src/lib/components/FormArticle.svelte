<script lang="ts">
  import Alert from '$lib/components/Alert.svelte';
  import { Visibility, zeus } from '$lib/zeus';
  import { goto } from '$app/navigation';
  import EventSearch from './InputEvent.svelte';
  import { page } from '$app/stores';
  import { _articleQuery } from '../../routes/posts/[group]/[uid]/edit/+page';
  import DateInput from '$lib/components/InputDate.svelte';
  import { DISPLAY_VISIBILITIES, HELP_VISIBILITY } from '$lib/display';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import InputText from './InputText.svelte';
  import InputSelectOne from './InputSelectOne.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputLinks from '$lib/components/InputLinks.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import { toasts } from '$lib/toasts';

  export let afterGoTo: (article: (typeof data)['article']) => string = (article) =>
    `/posts/${article.group.uid}/${article.uid}/`;
  export let hideEvent = false;
  export let data: {
    article: {
      uid: string;
      id: string;
      title: string;
      body: string;
      visibility: Visibility;
      group: {
        uid: string;
        name: string;
        id: string;
      };
      author?: {
        id: string;
        firstName: string;
        lastName: string;
        pictureFile: string;
        uid: string;
        groups: Array<{
          group: {
            name: string;
            uid: string;
          };
          title: string;
        }>;
      };
      eventId?: string;
      event?: {
        id: string;
        uid: string;
        title: string;
        startsAt: Date;
        visibility: Visibility;
        pictureFile: string;
      };
      links: Array<{ name: string; value: string }>;
      publishedAt: Date;
      pictureFile: string;
    };
  };

  let serverError = '';

  let confirmingDelete = false;

  let { id, event, eventId, title, author, body, publishedAt, visibility, links, group } =
    data.article;

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
            eventId: eventId ?? '',
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
      ({ id, event, eventId, title, author, body, publishedAt, links, group, visibility } =
        data.article);
      if (data.article.uid) {
        toasts.success(
          `Ton article ${DISPLAY_VISIBILITIES[visibility].toLowerCase()} a bien été ${
            id ? 'modifié' : 'créé'
          }`,
        );
        await goto(afterGoTo(data.article));
      }
    } finally {
      loading = false;
    }
  };
</script>

<form on:submit|preventDefault={updateArticle}>
  {#if !hideEvent}
    <EventSearch {event} label="Évènement lié" groupUid={$page.params.group} bind:id={eventId} />
  {/if}
  <InputText required label="Titre" maxlength={255} bind:value={title} />
  <DateInput required time label="Publier le" bind:value={publishedAt} />
  <InputSelectOne
    required
    bind:value={visibility}
    options={DISPLAY_VISIBILITIES}
    label="Visibilité"
    hint={HELP_VISIBILITY[visibility]}
  />
  <InputLongText label="Description" bind:value={body} rich />
  <InputLinks label="Liens" bind:value={links} />
  {#if serverError}
    <Alert theme="danger"
      >Impossible de sauvegarder les modifications : <br /><strong>{serverError}</strong></Alert
    >
  {/if}
  <section class="submit">
    {#if id === ''}
      <ButtonPrimary {loading} submits>Poster</ButtonPrimary>
    {:else if confirmingDelete}
      <h2>Es-tu sûr·e ?</h2>
      <ButtonSecondary
        on:click={() => {
          confirmingDelete = false;
        }}>Annuler</ButtonSecondary
      >
      <ButtonSecondary
        on:click={async () => {
          toasts.success(
            `Post ${title.slice(0, 20)}${title.length >= 20 ? '…' : ''} supprimé`,
            '',
            {
              lifetime: 5000,
              showLifetime: true,
              data: {
                id: data.article.id,
                confirm: true,
                gotoOnCancel: `${afterGoTo(data.article)}/edit/`.replaceAll('//', '/'),
              },
              labels: {
                action: 'Annuler',
                close: 'OK',
              },
              async action({ data, id }) {
                data.confirm = false;
                await toasts.remove(id);
                await goto(data.gotoOnCancel);
              },
              async closed({ data: { id, confirm } }) {
                if (confirm)
                  {await $zeus.mutate({
                    deleteArticlePicture: [{ id }, true],
                    deleteArticle: [{ id }, true],
                  });}
              },
            },
          );
          confirmingDelete = false;
          await goto('/');
        }}
        danger>Oui</ButtonSecondary
      >
      <ButtonSecondary
        on:click={() => {
          visibility = Visibility.Private;
          confirmingDelete = false;
        }}>Rendre privé</ButtonSecondary
      >
    {:else}
      <ButtonPrimary submits {loading}>Enregistrer</ButtonPrimary>
      {#if data.article.id}
        <ButtonSecondary
          danger
          on:click={() => {
            confirmingDelete = true;
          }}>Supprimer</ButtonSecondary
        >
      {/if}
    {/if}
  </section>
</form>

<style>
  form {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
  }

  .submit {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    margin-top: 2rem;
  }
</style>
