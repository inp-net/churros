<script lang="ts">
  import Alert from '$lib/components/Alert.svelte';
  import { Visibility, zeus } from '$lib/zeus';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { _articleQuery } from '../../routes/posts/[group]/[uid]/edit/+page';
  import { DISPLAY_VISIBILITIES, HELP_VISIBILITY_DYNAMIC } from '$lib/display';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import InputText from './InputText.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputLinks from '$lib/components/InputLinks.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import { toasts } from '$lib/toasts';
  import InputPillEvent from './InputPillEvent.svelte';
  import InputVisibility from './InputVisibility.svelte';
  import InputPillDate from './InputPillDate.svelte';
  import InputGroups from './InputGroups.svelte';

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
        pictureFile: string;
        pictureFileDark: string;
        children: Array<{
          name: string;
          studentAssociation?: { school: { name: string } } | undefined;
        }>;
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

  let { id, event, title, author, body, visibility, links, group } = data.article;

  let publishLater: Date | undefined = undefined;

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
            eventId: event?.id ?? '',
            groupId: group.id,
            title,
            body,
            publishedAt: (publishLater ?? new Date()).toISOString(),
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
      ({ id, event, title, author, body, links, group, visibility } = data.article);
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

<form class="form-article" on:submit|preventDefault={updateArticle}>
  <section class="author">
    {#await $zeus.query( { groups: [{}, { id: true, name: true, uid: true, pictureFile: true, pictureFileDark: true }] }, ) then { groups: options }}
      <InputGroups required label="" {options} bind:group></InputGroups>
    {/await}
    <InputVisibility bind:value={visibility}></InputVisibility>
  </section>
  <p class="explain-visibility">{HELP_VISIBILITY_DYNAMIC([group])[visibility]}</p>
  <div class="content">
    <InputText required label="Titre" bind:value={title}></InputText>
    <div class="description">
      <InputLongText rich bind:value={body} label=""></InputLongText>
    </div>
  </div>

  <section class="pills">
    {#if !hideEvent}
      {#await $zeus.query( { eventsOfGroup: [{ groupUid: group.uid }, { edges: { node: _articleQuery.event } }] }, ) then { eventsOfGroup: { edges } }}
        <InputPillEvent
          suggestions={edges.map((n) => n.node)}
          bind:event
          groupUid={$page.params.group}
        />
      {/await}
    {/if}
    <InputPillDate after={new Date()} bind:value={publishLater}>Publier plus tard</InputPillDate>
  </section>
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
                if (confirm) {
                  await $zeus.mutate({
                    deleteArticlePicture: [{ id }, true],
                    deleteArticle: [{ id }, true],
                  });
                }
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
  }

  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    margin: 1rem 0;
  }

  .submit {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    margin-top: 2rem;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  section.author {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.5ch;
    align-content: center;
    align-items: center;
  }

  section.author :global(.input-visibility) {
    margin-left: auto;
  }

  :global(.badge-visibility) {
    margin-left: auto;
  }

  .explain-visibility {
    margin-top: 0.125rem;
    margin-bottom: 0.25rem;
    font-size: 0.75em;
    text-align: right;
  }
</style>
