<script lang="ts">
  import { page } from '$app/stores';
  import { fragment, graphql, PendingValue, type FormPage } from '$houdini';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputFile, { withoutFilename } from '$lib/components/InputFile.svelte';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import ModalDeleteCustomPage from '$lib/components/ModalDeleteCustomPage.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { formatDate } from '$lib/dates';
  import {
    allLoaded,
    loaded,
    loading,
    mapLoading,
    onceAllLoaded,
    onceLoaded,
    type MaybeLoading,
  } from '$lib/loading';
  import { toasts } from '$lib/toasts';
  import type { Snapshot } from '@sveltejs/kit';
  import { subDays } from 'date-fns';
  import mime from 'mime';
  import IconBack from '~icons/mdi/arrow-left';
  import IconInsert from '~icons/mdi/attachment-plus';
  import IconRemove from '~icons/mdi/close';
  import IconDelete from '~icons/mdi/delete-outline';
  import IconGoToView from '~icons/mdi/file-outline';
  import IconInsertImage from '~icons/mdi/image-plus';

  export const snapshot: Snapshot = {
    capture: () => ({ title, body }),
    restore: (cached) => {
      if (!('title' in cached && 'body' in cached)) return;
      if (title !== cached.title || body !== cached.body)
        toasts.success('Modifications restaurées 😉');
      ({ title, body } = cached);
    },
  };

  export let saveChanges: (data: { title: string; body: string }) => Promise<void>;
  export let pageItem: FormPage;
  $: data = fragment(
    pageItem,
    graphql(`
      fragment FormPage on Page @loading(cascade: true) {
        ...ModalDeleteCustomPage @loading
        id
        body
        bodyHtml
        title
        path
        files
        filesURLs
        updatedAt
        canBeEdited
        group {
          uid
        }
        studentAssociation {
          uid
        }
        lastAuthor {
          uid
          pictureURL
          pictureFile
          fullName
        }
      }
    `),
  );

  const AddFile = graphql(`
    mutation AddFileToPage($id: ID!, $file: File!) {
      addFileToPage(page: $id, file: $file) {
        ... on Error {
          message
        }
        ... on ZodError {
          fieldErrors {
            path
            message
          }
        }
        ... on MutationAddFileToPageSuccess {
          data {
            ...FormPage
          }
        }
      }
    }
  `);

  const RemoveFile = graphql(`
    mutation RemoveFileFromPage($id: ID!, $filename: String!) {
      removeFileFromPage(page: $id, filename: $filename) {
        ... on Error {
          message
        }
        ... on ZodError {
          fieldErrors {
            path
            message
          }
        }
        ... on MutationRemoveFileFromPageSuccess {
          data {
            ...FormPage
          }
        }
      }
    }
  `);

  let files: FileList;
  let fileInputElement: HTMLInputElement;
  let title: string = '';
  let body: string = '';
  let bodyHtml: MaybeLoading<string> = PendingValue;
  let openDeletionConfirmation: () => void;

  let saving = false;
  $: previewing =
    'currentTab' in $page.state
      ? $page.state.currentTab === '#preview'
      : $page.url.hash === '#preview';

  $: if (previewing) {
    bodyHtml = PendingValue;
    fetch('/markdown', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown: body }),
    })
      .then(async (res) => {
        if (res.ok) {
          const responseData = await res.json();
          return responseData.html;
        }
        return res.text;
      })
      .then((html) => {
        bodyHtml = html;
      });
  }

  $: if ($data && allLoaded($data) && !title && !body) ({ title, body, bodyHtml } = $data);
  $: linkedResource = $data?.group ? 'groups' : 'student-associations';
  $: linkedResourceUid = $data?.group?.uid ?? $data?.studentAssociation!.uid;
</script>

{#if $data}
  <!-- @ts-expect-error same weird behavior as for linkedResourceUid, it thinks the fragment does not exist -->
  <ModalDeleteCustomPage bind:openDeletionConfirmation customPage={$data}></ModalDeleteCustomPage>
  <form
    on:submit|preventDefault={async () => {
      if (!allLoaded(page)) return;
      saving = true;
      await saveChanges({ title, body });
      saving = false;
    }}
  >
    <h1>
      <slot name="before-title">
        <ButtonBack
          go={onceLoaded(
            linkedResourceUid,
            (uid) => onceLoaded($data.path, (path) => `/${linkedResource}/${uid}/${path}`, ''),
            '',
          )}
        ></ButtonBack>
      </slot>
      <div class="title-input">
        {#if loaded($data.title)}
          <InputText bind:value={title} label=""></InputText>
        {:else}
          <LoadingText>Lorem ipsum dolor sit amet, consequitur jsp</LoadingText>
        {/if}
      </div>
    </h1>
    <section class="metadata">
      <p class="muted">
        Dernière modification le <LoadingText
          value={loaded($data.updatedAt) ? formatDate($data.updatedAt) : PendingValue}
        >
          {formatDate(subDays(new Date(), 5))}
        </LoadingText>
        {#if loading($data.canBeEdited, false) && allLoaded($data.lastAuthor) && $data.lastAuthor}
          par <AvatarPerson inline small href="/users/{$data.lastAuthor.uid}" {...$data.lastAuthor}
          ></AvatarPerson>
        {/if}
      </p>
    </section>
    <NavigationTabs
      tabs={[
        { href: previewing ? '#edit' : '.', name: 'Modifier' },
        { href: previewing ? '.' : '#preview', name: 'Aperçu' },
      ]}
    ></NavigationTabs>
    {#if previewing}
      <div data-user-html>
        {#if loaded(bodyHtml)}
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html bodyHtml}
        {:else}
          <LoadingText>{body}</LoadingText>
        {/if}
      </div>
    {:else}
      <div class="editing-area">
        {#if loaded($data.body)}
          <InputLongText bind:value={body} label="Contenu"></InputLongText>
        {:else}
          <LoadingText lines={20}></LoadingText>
        {/if}
        <InputFile
          multiple
          bind:inputElement={fileInputElement}
          bind:files
          dropzone
          on:change={async () => {
            await Promise.all(
              Array.from(files ?? []).map(async (file) => {
                if (!loaded($data.id)) return;
                const result = await AddFile.mutate({ id: $data.id, file });
                toasts.mutation(
                  result,
                  'addFileToPage',
                  `${file.name} ajouté`,
                  `Impossible d'ajouter ${file.name}`,
                );
                files = withoutFilename(files, file.name);
              }),
            );
          }}
        >
          <ul class="nobullet new-files">
            {#each Array.from(files ?? []) as file}
              <li class="file new">
                <code>{file.name}</code>
                <!-- TOOD use a progress bar instead -->
                <LoadingSpinner></LoadingSpinner>
                <ButtonGhost
                  on:click={() => {
                    files = withoutFilename(files, file.name);
                  }}
                >
                  <IconRemove></IconRemove>
                </ButtonGhost>
              </li>
            {/each}
          </ul>
          <ul class="nobullet existing-files">
            {#each $data.files.toReversed().entries() as [i, file]}
              {@const filestem = mapLoading(file, (file) => file.split('/').at(-1) ?? '')}
              {@const fileURL = $data.filesURLs.toReversed()[i]}
              {@const isImage = onceLoaded(
                filestem,
                (filestem) => Boolean(mime.getType(filestem)?.startsWith('image/')),
                false,
              )}
              <li class="file existing">
                <code class="name"
                  ><LoadingText tag="code" value={filestem}>Lorem ipsum.txt</LoadingText></code
                >

                <ButtonGhost
                  help="Supprimer le fichier"
                  danger
                  on:click={async () => {
                    if (!loaded($data.id) || !loaded(file)) return;
                    await RemoveFile.mutate({ id: $data.id, filename: file });
                  }}
                >
                  <IconDelete --text="var(--danger-link)"></IconDelete>
                </ButtonGhost>
                <ButtonGhost
                  track="insert-file-into-page"
                  on:click={() => {
                    if (!loaded(fileURL) || !loaded(filestem)) return;
                    body += `\n${isImage ? '!' : ''}[${filestem}](${fileURL})\n`;
                  }}
                  help={`Insérer ${isImage ? "l'image" : 'le fichier'} dans la page`}
                >
                  {#if isImage}
                    <IconInsertImage></IconInsertImage>
                  {:else}
                    <IconInsert></IconInsert>
                  {/if}
                </ButtonGhost>
              </li>
            {/each}
          </ul>
        </InputFile>
      </div>
    {/if}
    <section class="actions">
      <ButtonSecondary
        icon={IconBack}
        href={onceLoaded(linkedResourceUid, (uid) => `/${linkedResource}/${uid}/edit/pages`, '')}
        >Toutes les pages</ButtonSecondary
      >
      <ButtonSecondary
        icon={IconGoToView}
        href={onceAllLoaded(
          [linkedResourceUid, $data.path],
          (uid, path) => `/${linkedResource}/${uid}/${path}`,
          '',
        )}
        >Voir la page
      </ButtonSecondary>
      <ButtonSecondary icon={IconDelete} danger on:click={() => openDeletionConfirmation()}>
        Supprimer
      </ButtonSecondary>
      <div class="to-right"></div>
      <ButtonPrimary loading={saving} submits>Enregistrer</ButtonPrimary>
    </section>
  </form>
{/if}

<style>
  h1 {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    align-items: center;
  }

  .title-input {
    flex: 1;
  }

  .title-input :global(input) {
    font-size: 1em;
  }

  .editing-area :global(textarea) {
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
  }

  .editing-area :global(.input-file) {
    /* TODO add a prop to InputFile instead */
    border-top: none !important;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  section.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    margin-top: 1rem;
  }

  section.actions .to-right {
    margin-left: auto;
  }

  section.metadata {
    margin-bottom: 2rem;
  }

  section.metadata p {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.5ch;
    align-items: center;
  }

  .new-files + .existing-files::before {
    margin: 1rem 0;
    content: '';
    border-top: var(--border-block) dashed var(--muted-border);
  }

  li.file {
    display: grid;
    grid-template-columns: auto repeat(2, max-content);
    gap: 0.5rem 0.5rem;
    text-align: left;
  }
</style>
