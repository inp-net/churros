<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import {
    Visibility,
    fragment,
    graphql,
    type ArticleForm,
    type ArticleForm$data,
    type FormArticleGroup,
  } from '$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import InputLinks from '$lib/components/InputLinks.svelte';
  import { DISPLAY_VISIBILITIES, HELP_VISIBILITY_DYNAMIC } from '$lib/display';
  import { groupLogoSrc } from '$lib/logos';
  import { isDark } from '$lib/theme';
  import { toasts } from '$lib/toasts';
  import { notNull } from '$lib/typing';
  import { isFuture, isPast } from 'date-fns';
  import IconClose from '~icons/mdi/close';
  import IconSend from '~icons/mdi/send-outline';
  import BadgeVisibility from './BadgeVisibility.svelte';
  import ButtonBack from './ButtonBack.svelte';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import InputGroups from './InputGroups.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputPillDate from './InputPillDate.svelte';
  import InputPillEvent from './InputPillEvent.svelte';
  import InputText from './InputText.svelte';
  import InputVisibility from './InputVisibility.svelte';
  import LoadingSpinner from './LoadingSpinner.svelte';
  import Modal from './Modal.svelte';

  export let afterGoTo: (article: { uid: string; group: { uid: string } }) => string = (article) =>
    `/posts/${article.group.uid}/${article.uid}/`;

  export let data: ArticleForm | null;
  $: Article = fragment(
    data,
    graphql`
      fragment ArticleForm on Article {
        uid
        id
        title
        body
        visibility
        group {
          ...FormArticleGroup @mask_disable
        }
        author {
          id
          firstName
          lastName
          pictureFile
          uid
          groups {
            group {
              name
              uid
            }
            title
          }
        }
        event {
          id
          ...InputEventEvent @mask_disable
        }
        links {
          name
          value
        }
        publishedAt
        pictureFile
      }
    `,
  );

  const notificationSendCountQuery = graphql(`
    query NotificationSendCountForArticle($visibility: Visibility!, $groupUid: String!) {
      notificationsSendCountForArticle(visibility: $visibility, groupUid: $groupUid)
    }
  `);

  let notificationSendCount: number | undefined;

  const groupOptions = graphql(`
    query InputGroupOptions {
      groups {
        id
        name
        uid
        pictureFile
        pictureFileDark
      }
    }
  `);

  const upsertArticle = graphql(`
    mutation UpsertArticle(
      $id: ID!
      $authorId: ID
      $eventId: ID
      $groupId: ID!
      $title: String!
      $body: String!
      $publishedAt: DateTime!
      $links: [LinkInput!]!
      $visibility: Visibility!
    ) {
      upsertArticle(
        id: $id
        authorId: $authorId
        eventId: $eventId
        groupId: $groupId
        title: $title
        body: $body
        publishedAt: $publishedAt
        links: $links
        visibility: $visibility
      ) {
        __typename
        ... on MutationUpsertArticleSuccess {
          data {
            ...ArticleForm
          }
        }
        ... on Error {
          message
        }
      }
    }
  `);

  const deleteArticle = graphql(`
    mutation DeleteArticle($id: ID!) {
      deleteArticle(id: $id)
      deleteArticlePicture(id: $id)
    }
  `);

  let serverError = '';
  let confirmingDelete = false;
  export let initialGroup: FormArticleGroup;

  const EMPTY_ARTICLE: ArticleForm$data = {
    author: null,
    body: '',
    event: null,
    // @ts-expect-error TODO understand why @mask_disable does not work on fragment definition
    group: initialGroup,
    id: '',
    links: [] as ArticleForm$data['links'],
    pictureFile: '',
    publishedAt: new Date(),
    title: '',
    uid: '',
    visibility: Visibility.Private,
  };

  $: ({ id, event, uid, title, author, body, visibility, links, group } =
    $Article ?? EMPTY_ARTICLE);
  $: publishLater = $Article
    ? isFuture($Article.publishedAt)
      ? $Article.publishedAt
      : undefined
    : undefined;
  $: pastDate = publishLater === undefined ? false : isPast(publishLater);

  let loading = false;
  const submit = async () => {
    if (loading) return;
    if (!$Article) return;
    try {
      loading = true;
      const result = await upsertArticle.mutate({
        id: $Article.id,
        authorId: author?.id,
        eventId: event?.id,
        groupId: group.id,
        title,
        body,
        links,
        visibility,
        publishedAt: publishLater ?? new Date(),
      });

      if (result.errors || !result.data) {
        serverError = result.errors?.[0].message ?? 'Erreur inconnue';
        return;
      }

      if (result.data.upsertArticle.__typename === 'Error') {
        serverError = result.data.upsertArticle.message;
        return;
      }

      serverError = '';
      if ($Article.uid) {
        toasts.success(
          `Ton article ${DISPLAY_VISIBILITIES[visibility].toLowerCase()} a bien été ${
            id ? 'modifié' : 'créé'
          }`,
        );
        await goto(afterGoTo($Article));
      }
    } finally {
      loading = false;
    }
  };

  $: canChangeGroup = !id;

  let modalWarnNotifications: HTMLDialogElement;
</script>

<Modal bind:element={modalWarnNotifications}>
  <div class="modal-content">
    <h1>Sûr·e de toi?</h1>
    <p>
      Tu t'apprêtes à envoyer une notification à <strong>
        <span class="notified-count">
          {#if notificationSendCount !== undefined}
            plus de {notificationSendCount} personnes.
          {:else}
            beaucoup de personnes.
          {/if}
        </span>
      </strong>
      Utilise plutôt la visibilité
      <BadgeVisibility inline visibility={Visibility.GroupRestricted}></BadgeVisibility> si ça te paraît
      trop.
    </p>
    <div class="actions">
      <ButtonSecondary
        icon={IconClose}
        on:click={() => {
          modalWarnNotifications.close();
        }}>Annuler</ButtonSecondary
      >
      <ButtonSecondary icon={IconSend} on:click={submit}>Envoyer</ButtonSecondary>
    </div>
  </div>
</Modal>

<form
  class="form-article"
  on:submit|preventDefault={async () => {
    if (!id && (visibility === Visibility.Public || visibility === Visibility.SchoolRestricted)) {
      const { data } = await notificationSendCountQuery.fetch({
        variables: { visibility, groupUid: group.uid },
      });
      if (data?.notificationsSendCountForArticle !== undefined)
        notificationSendCount = data.notificationsSendCountForArticle;
      modalWarnNotifications.showModal();
    } else {
      await submit();
    }
  }}
>
  <h1>
    <ButtonBack />
    <InputText required label="" bind:value={title}></InputText>
  </h1>
  <div class="content">
    <div class="description">
      <InputLongText rich bind:value={body} label=""></InputLongText>
    </div>
    <section class="author">
      {#if canChangeGroup && browser}
        {#await groupOptions.fetch()}
          <LoadingSpinner></LoadingSpinner>
        {:then { data }}
          {#if data}
            <InputGroups required label="" options={data.groups} bind:group></InputGroups>
          {:else}
            <Alert theme="danger">Impossible de charger les groupes</Alert>
          {/if}
        {/await}
      {:else}
        <a href="/groups/{group.uid}" class="group-link">
          <img src={groupLogoSrc($isDark, group)} alt={group.name} class="group-logo" />
        </a>
        <a href="/groups/{group.uid}" class="group">{group.name}</a>
      {/if}
      <InputVisibility bind:value={visibility}></InputVisibility>
    </section>
    <p class="explain-visibility">
      {#if group.children}
        {HELP_VISIBILITY_DYNAMIC([group, ...group.children])[visibility]}
      {/if}
    </p>
  </div>
  <section class="pills">
    <InputPillEvent suggestions={group.events.nodes.filter(notNull)} bind:event groupUid={group.uid}
    ></InputPillEvent>
    <InputPillDate after={new Date()} bind:value={publishLater}>Publier plus tard</InputPillDate>
  </section>
  <InputLinks label="Liens" bind:value={links} />
  {#if serverError}
    <Alert theme="danger"
      >Impossible de sauvegarder les modifications : <br /><strong>{serverError}</strong></Alert
    >
  {/if}
  {#if pastDate}
    <Alert theme="danger"
      >Impossible de programmer une publication à cette date <br /><strong>{serverError}</strong
      ></Alert
    >
  {/if}
  <section class="submit">
    {#if id === ''}
      <ButtonPrimary {loading} submits disabled={pastDate}>Publier</ButtonPrimary>
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
                id,
                confirm: true,
                gotoOnCancel: `${afterGoTo({ uid, group })}/edit/`.replaceAll('//', '/'),
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
                  await deleteArticle.mutate({ id });
                
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
      <ButtonPrimary {loading} submits disabled={pastDate}>Enregistrer</ButtonPrimary>
      {#if id}
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
  .modal-content {
    max-width: 500px;
  }

  .notified-count {
    display: inline-block;
  }

  .modal-content .actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: end;
    width: 100%;
    margin-top: 1rem;
  }

  form {
    display: flex;
    flex-flow: column wrap;
  }

  h1 {
    display: flex;
    gap: 1rem;
    align-items: center;
    width: 100%;
    margin-bottom: 1rem;
  }

  h1 :global(.base-input) {
    flex-grow: 1;
  }

  h1 :global(input) {
    font-size: 1.2rem;
    font-weight: bold;
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
  }

  section.author {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.5ch;
    align-content: center;
    align-items: center;
    margin-top: 0.75rem;
  }

  .group-logo {
    width: 2.25rem;
    height: 2.25rem;
    overflow: hidden;
    object-fit: contain;
    background: var(--bg);
    border: 2px solid var(--muted-border);
    border-radius: 50%;
  }

  .group-logo:hover,
  .group-logo:focus-visible {
    border-color: var(--primary-link);
  }

  section.author :global(.input-visibility) {
    margin-left: auto;
  }

  :global(.badge-visibility) {
    margin-left: auto;
  }

  .explain-visibility {
    margin-bottom: 0.25rem;
    font-size: 0.75em;
    text-align: right;
  }
</style>
