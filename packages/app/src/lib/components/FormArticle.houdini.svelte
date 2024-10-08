<script lang="ts">
  import { goto } from '$app/navigation';
  import {
    fragment,
    graphql,
    PendingValue,
    Visibility,
    type FormArticle,
    type FormArticleGroups$data,
    type UpdateArticle$input,
  } from '$houdini';
  import { track } from '$lib/analytics';
  import Alert from '$lib/components/Alert.svelte';
  import InputLinks from '$lib/components/InputLinks.svelte';
  import InputTextGhost from '$lib/components/InputTextGhost.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { HELP_VISIBILITY, HELP_VISIBILITY_DYNAMIC } from '$lib/display';
  import { allLoaded, loaded, type MaybeLoading } from '$lib/loading';
  import { groupLogoSrc } from '$lib/logos';
  import { route } from '$lib/ROUTES';
  import { isDark } from '$lib/theme';
  import { toasts } from '$lib/toasts';
  import { zeus } from '$lib/zeus';
  import IconClose from '~icons/mdi/close';
  import IconSend from '~icons/mdi/send-outline';
  import BadgeVisibility from './BadgeVisibility.svelte';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import InputGroups from './InputGroups.houdini.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputVisibility from './InputVisibility.houdini.svelte';
  import LoadingSpinner from './LoadingSpinner.svelte';
  import Modal from './ModalDialog.svelte';

  export let afterGoTo: (article: { group: { uid: string }; localID: string }) => string = (
    article,
  ) => route('/posts/[id]', article.localID);

  export let groups: FormArticleGroups$data[];
  graphql(`
    fragment FormArticleGroups on Group {
      ...InputGroups @mask_disable
      uid
      name
      children {
        name
        studentAssociation {
          school {
            name
          }
        }
      }
      studentAssociation {
        school {
          name
        }
      }
    }
  `);

  export let article: FormArticle | null;
  $: data = fragment(
    article,
    graphql(`
      fragment FormArticle on Article @loading(cascade: true) {
        uid
        id
        title
        body
        visibility
        published
        group {
          uid
          name
          id
          pictureFile
          pictureFileDark
          studentAssociation {
            school {
              name
            }
          }
          children {
            name
            studentAssociation {
              school {
                name
              }
            }
          }
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
          title
          localID
        }
        links {
          computedValue: url
          url
          rawURL
          text
        }
        publishedAt
        pictureFile
      }
    `),
  );

  const serverError = '';

  let confirmingDelete = false;

  const updating = false;

  // If $data is not provided, immediately mark the data has loaded
  // (there's no data to load)
  let inputLoaded = Boolean($data);
  let input: Omit<UpdateArticle$input, 'group'> = {
    body: '',
    id: '',
    links: [],
    publishedAt: new Date(),
    title: '',
    visibility: Visibility.Public,
    event: null,
  };

  export let selectedGroup: FormArticleGroups$data | null = null;

  $: if (!inputLoaded && allLoaded($data) && $data) {
    input = structuredClone({
      ...$data,
      links: $data.links.map(({ rawURL, text }) => ({ url: rawURL, text })),
      group: $data.group.uid,
      event: $data.event ? `e:${$data.event.localID}` : null,
    });
    inputLoaded = true;
  }

  // $: ({ body } = input);

  // $: input = {
  //   body: loading($data?.body ?? '', ''),
  //   group: loading($data?.group.uid ?? '', ''),
  //   id: loading($data?.id ?? '', ''),
  //   links: $data?.links.filter(allLoaded) ?? [],
  //   publishedAt: loading($data?.publishedAt, null) ?? new Date(),
  //   title: loading($data?.title ?? '', ''),
  //   visibility: loading($data?.visibility ?? Visibility.Public, Visibility.Public),
  //   eventId: loading($data?.eventId, null),
  // };

  async function updateArticle() {
    if (!allLoaded($data)) return;
    await graphql(`
      mutation UpdateArticle(
        $id: ID!
        $group: UID!
        $title: String!
        $body: String!
        $publishedAt: DateTime!
        $visibility: Visibility!
        $links: [LinkInput!]!
        $event: ID
      ) {
        addLinks(id: $id, links: $links, duplicates: Replace) {
          ... on MutationAddLinksSuccess {
            data {
              __typename
            }
          }
          ...MutationErrors
        }
        upsertArticle(
          id: $id
          group: $group
          title: $title
          body: $body
          publishedAt: $publishedAt
          visibility: $visibility
          event: $event
        ) {
          ...MutationErrors
          ... on MutationUpsertArticleSuccess {
            data {
              __typename
              localID
              group {
                uid
              }
              ...FormArticle
            }
          }
        }
      }
    `)
      .mutate({
        ...input,
        group: selectedGroup?.uid || $data?.group.uid || '',
      })
      .then((result) => {
        if (
          toasts.mutation(
            result,
            'upsertArticle',
            `Ton post a bien été ${input.id ? 'modifié' : 'créé'}`,
            'Impossible de sauvegarder le post',
          )
        ) {
          // @ts-expect-error TODO fix typing in toasts.mutation
          goto(afterGoTo(result.data.upsertArticle.data));
        }
      });
  }

  // $: canChangeGroup = !id;

  let modalWarnNotifications: HTMLDialogElement;
  let openModalWarnNotifications: () => void;
  let notificationsSendCountForArticle: MaybeLoading<number> = PendingValue;
  const NotificationSendCountQuery = graphql(`
    query NotificationsSendCountForPost($visibility: Visibility!, $group: UID!) {
      notificationsSendCountForArticle(visibility: $visibility, group: $group)
    }
  `);
</script>

<Modal
  bind:element={modalWarnNotifications}
  bind:open={openModalWarnNotifications}
  on:open={async () => {
    if (!selectedGroup) return;
    const result = await NotificationSendCountQuery.fetch({
      variables: {
        group: selectedGroup.uid,
        visibility: input.visibility,
      },
    });
    if (result.data) ({ notificationsSendCountForArticle } = result.data);
  }}
>
  <div class="modal-content">
    <h1>Sûr·e de toi?</h1>
    <p>
      Tu t'apprêtes à envoyer une notification à <strong
        >plus de
        <span class="notified-count">
          {#if !loaded(notificationsSendCountForArticle)}
            <LoadingSpinner></LoadingSpinner>
          {:else}
            {notificationsSendCountForArticle}
          {/if}
        </span>
        personnes</strong
      >. Utilise plutôt la visibilité
      <BadgeVisibility inline visibility={Visibility.GroupRestricted}></BadgeVisibility> si ça te paraît
      trop.
    </p>
    <div class="actions">
      <ButtonSecondary
        track="post-visibility-warning-backoff"
        icon={IconClose}
        on:click={() => {
          modalWarnNotifications.close();
        }}>Annuler</ButtonSecondary
      >
      <ButtonSecondary
        track="post-visibility-warning-confirm"
        icon={IconSend}
        on:click={updateArticle}>Envoyer</ButtonSecondary
      >
    </div>
  </div>
</Modal>

{#if $data?.event}
  <Alert theme="success">
    <p>
      Ce post est lié à l'évènement
      <LoadingText value={$data.event.title} />
    </p>
  </Alert>
{:else}
  <Alert theme="primary">
    <p>
      Pour créer un post lié à un évènement, se rendre sur la page de l'évènement puis choisir ⋮ >
      Post lié
    </p>
  </Alert>
{/if}

<form
  class="form-article"
  on:submit|preventDefault={async () => {
    if (
      !input.id &&
      (input.visibility === Visibility.Public || input.visibility === Visibility.SchoolRestricted)
    ) {
      openModalWarnNotifications();
      track('post-visibiliy-warning-shown', { visibility: input.visibility });
    } else {
      await updateArticle();
    }
  }}
>
  <h1>
    <InputTextGhost placeholder="Titre" required label="" bind:value={input.title}></InputTextGhost>
  </h1>
  <div class="content">
    <div class="description">
      <InputLongText rich bind:value={input.body} label=""></InputLongText>
    </div>
    <section class="author">
      {#if !input.id}
        <InputGroups required label="" options={groups} bind:group={selectedGroup}></InputGroups>
      {:else if selectedGroup}
        <a href="/groups/{selectedGroup}" class="group-link">
          <img
            src={groupLogoSrc($isDark, selectedGroup)}
            alt={selectedGroup.name}
            class="group-logo"
          />
        </a>
        <a href="/groups/{selectedGroup.uid}" class="group">
          <LoadingText value={selectedGroup.name}>Lorem ipsum</LoadingText>
        </a>
      {/if}
      <InputVisibility bind:value={input.visibility}></InputVisibility>
    </section>
    <p class="explain-visibility">
      {#if selectedGroup}
        {HELP_VISIBILITY_DYNAMIC([selectedGroup, ...selectedGroup.children])[input.visibility]}
      {:else}
        {HELP_VISIBILITY[input.visibility]}
      {/if}
    </p>
  </div>

  <InputLinks label="Liens" bind:value={input.links} />
  {#if serverError}
    <Alert theme="danger"
      >Impossible de sauvegarder les modifications : <br /><strong>{serverError}</strong></Alert
    >
  {/if}
  <section class="submit">
    {#if !input.id}
      <ButtonPrimary loading={updating} submits>Publier</ButtonPrimary>
    {:else if confirmingDelete}
      <h2>Es-tu sûr·e ?</h2>
      <ButtonSecondary
        on:click={() => {
          confirmingDelete = false;
        }}>Annuler</ButtonSecondary
      >
      <ButtonSecondary
        on:click={async () => {
          if (!input.id) return;
          toasts.success(`Post supprimé`, '', {
            lifetime: 5000,
            showLifetime: true,
            data: {
              id: input.id,
              confirm: true,
              // gotoOnCancel: `${afterGoTo($data)}/edit/`.replaceAll('//', '/'),
              gotoOnCancel: route('/posts/[id]/edit', input.id),
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
          });
          confirmingDelete = false;
          await goto('/');
        }}
        danger>Oui</ButtonSecondary
      >
      <ButtonSecondary
        on:click={() => {
          input.visibility = Visibility.Private;
          confirmingDelete = false;
        }}>Rendre privé</ButtonSecondary
      >
    {:else}
      <ButtonPrimary loading={updating} submits>Enregistrer</ButtonPrimary>
      {#if input.id}
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
    margin-top: 2rem;
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
    border-color: var(--primary);
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
