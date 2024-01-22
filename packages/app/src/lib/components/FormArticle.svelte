<script lang="ts">
  import Alert from '$lib/components/Alert.svelte';
  import { type EventFrequency, Visibility, zeus } from '$lib/zeus';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { _articleQuery } from '../../routes/(app)/posts/[group]/[uid]/edit/+page';
  import { DISPLAY_VISIBILITIES, HELP_VISIBILITY_DYNAMIC } from '$lib/display';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import IconSend from '~icons/mdi/send-outline';
  import InputText from './InputText.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputLinks from '$lib/components/InputLinks.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import { toasts } from '$lib/toasts';
  import InputVisibility from './InputVisibility.svelte';
  import InputPillDate from './InputPillDate.svelte';
  import InputGroups from './InputGroups.svelte';
  import IconEvent from '~icons/mdi/calendar-outline';
  import IconClose from '~icons/mdi/close';
  import { me } from '$lib/session';
  import ButtonBack from './ButtonBack.svelte';
  import { groupLogoSrc } from '$lib/logos';
  import { isDark } from '$lib/theme';
  import { isFuture, isPast } from 'date-fns';
  import Modal from './Modal.svelte';
  import LoadingSpinner from './LoadingSpinner.svelte';
  import BadgeVisibility from './BadgeVisibility.svelte';
  import InputPillEvent from './InputPillEvent.svelte';

  export let afterGoTo: (article: (typeof data)['article']) => string = (article) =>
    `/posts/${article.group.uid}/${article.uid}/`;
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
        studentAssociation?: { school: { name: string } } | undefined;
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
        endsAt: Date;
        visibility: Visibility;
        pictureFile: string;
        recurringUntil?: Date | undefined;
        location: string;
        frequency: EventFrequency;
      };
      links: Array<{ name: string; value: string }>;
      publishedAt: Date;
      pictureFile: string;
    };
  };

  let serverError = '';

  let confirmingDelete = false;

  let { id, event, title, author, body, visibility, links, group } = data.article;

  let publishLater: Date | undefined = isFuture(data.article.publishedAt)
    ? data.article.publishedAt
    : undefined;

  $: pastDate = publishLater === undefined ? false : isPast(publishLater);

  let loading = false;
  const updateArticle = async () => {
    if (loading) return;
    try {
      loading = true;
      const { upsertArticle } = await $zeus.mutate({
        upsertArticle: [
          {
            id,
            authorId: (author ?? $me)!.id,
            eventId: event?.id ?? '',
            groupId: group.id,
            title,
            body,
            publishedAt: (publishLater ?? data.article.publishedAt ?? new Date()).toISOString(),
            links,
            visibility,
          },
          {
            '__typename': true,
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

  $: canChangeGroup = !id;

  let modalWarnNotifications: HTMLDialogElement;
</script>

<Modal bind:element={modalWarnNotifications}>
  <div class="modal-content">
    <h1>Sûr·e de toi?</h1>
    <p>
      Tu t'apprêtes à envoyer une notification à <strong
        >plus de
        <span class="notified-count">
          {#await $zeus.query( { notificationsSendCountForArticle: [{ visibility, groupUid: group.uid }, true] }, )}
            <LoadingSpinner></LoadingSpinner>
          {:then { notificationsSendCountForArticle }}
            {notificationsSendCountForArticle}
          {/await}
        </span>
        personnes</strong
      >. Utilise plutôt la visibilité
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
      <ButtonSecondary icon={IconSend} on:click={updateArticle}>Envoyer</ButtonSecondary>
    </div>
  </div>
</Modal>

<form
  class="form-article"
  on:submit|preventDefault={async () => {
    if (!id && (visibility === Visibility.Public || visibility === Visibility.SchoolRestricted))
      modalWarnNotifications.showModal();
    else await updateArticle();
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
      {#if canChangeGroup}
        {#await $zeus.query( { groups: [{}, { id: true, name: true, uid: true, pictureFile: true, pictureFileDark: true }] }, )}
          <LoadingSpinner></LoadingSpinner>
        {:then { groups: options }}
          <InputGroups required label="" {options} bind:group></InputGroups>
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
      {HELP_VISIBILITY_DYNAMIC([group, ...group.children])[visibility]}
    </p>
  </div>
  <section class="pills">
    {#await $zeus.query( { eventsOfGroup: [{ groupUid: group.uid }, { edges: { node: _articleQuery.event } }] }, )}
      <ButtonSecondary loading icon={IconEvent}>Évènement</ButtonSecondary>
    {:then { eventsOfGroup: { edges } }}
      <InputPillEvent
        suggestions={edges.map((n) => n.node)}
        bind:event
        groupUid={$page.params.group}
      ></InputPillEvent>
    {/await}
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
      <ButtonPrimary {loading} submits disabled={pastDate}>Enregistrer</ButtonPrimary>
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
    background: var(--bg);
    border: 2px solid var(--muted-border);
    border-radius: 50%;
    object-fit: contain;
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
