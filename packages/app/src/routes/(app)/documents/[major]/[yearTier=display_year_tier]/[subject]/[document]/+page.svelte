<script lang="ts">
  //@ts-expect-error Untyped lib
  import SEO from 'svelte-seo';
  import IconDelete from '~icons/mdi/delete-outline';
  import IconEdit from '~icons/mdi/edit-outline';
  import IconBack from '~icons/mdi/undo-variant';
  import type { PageData } from './$types';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import { page } from '$app/stores';
  import { formatDate } from '$lib/dates';
  import { isSameDay } from 'date-fns';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import { zeus, DocumentType } from '$lib/zeus';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import CardComment from '$lib/components/CardComment.svelte';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import { env } from '$env/dynamic/public';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import { me } from '$lib/session';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import { goto } from '$app/navigation';
  import { ICONS_DOCUMENT_TYPES } from '$lib/display';
  import { toasts } from '$lib/toasts';

  const { PUBLIC_STORAGE_URL } = env;

  export let data: PageData;

  let newComment = {
    body: '',
  };
  let replyingTo: { body: string; inReplyToId: string } = { body: '', inReplyToId: '' };
  let confirmingDelete = false;

  const documentTypesWithSolutions = new Set<DocumentType>([
    DocumentType.Exam,
    DocumentType.Exercises,
    DocumentType.GradedExercises,
    DocumentType.Practical,
    DocumentType.PracticalExam,
  ]);

  async function addComment(
    comment: { body: string; inReplyToId: string } | undefined = undefined,
  ) {
    const { upsertComment } = await $zeus.mutate({
      upsertComment: [
        {
          documentId: document.id,
          ...(comment ?? newComment),
        },
        {
          id: true,
          bodyHtml: true,
          body: true,
          createdAt: true,
          updatedAt: true,
          inReplyToId: true,
          author: { uid: true, fullName: true, pictureFile: true },
        },
      ],
    });
    data.document.comments.edges = [...data.document.comments.edges, { node: upsertComment }];
    if (!comment) {
      newComment = {
        body: '',
      };
    }
  }
  async function removeComment(id: string) {
    await $zeus.mutate({
      deleteComment: [{ id }, true],
    });
    window.location.reload();
  }
  async function editComment(id: string, body: string) {
    const { upsertComment } = await $zeus.mutate({
      upsertComment: [
        {
          id,
          documentId: document.id,
          body,
        },
        {
          id: true,
          bodyHtml: true,
          body: true,
          createdAt: true,
          updatedAt: true,
          inReplyToId: true,
          author: { uid: true, fullName: true, pictureFile: true },
        },
      ],
    });
    data.document.comments.edges = data.document.comments.edges.map(({ node }) =>
      node.id === upsertComment.id ? { node: upsertComment } : { node },
    );
  }
  async function reply() {
    if (!replyingTo) return;
    await addComment(replyingTo);
    replyingTo = { body: '', inReplyToId: '' };
  }

  $: ({
    major,
    subject,
    document,
    document: {
      title,
      schoolYear,
      descriptionHtml,
      createdAt,
      updatedAt,
      uploader,
      comments,
      solutionPaths,
      paperPaths,
      type,
    },
  } = data);
  $: emptyDocument = solutionPaths.length + paperPaths.length === 0;
</script>

<SEO
  title="{subject.shortName || subject.name} - {title}"
  description="La Frappe sur Churros: Sauve tes partiels!\n{descriptionHtml}"
  applicationName="Churros"
  keywords="{subject.uid}, document, cours"
></SEO>

<Breadcrumbs root="/documents">
  <Breadcrumb href="../../..">{major.shortName}</Breadcrumb>
  <Breadcrumb href="../..">{$page.params.yearTier.toUpperCase().replaceAll('-', ' ')}</Breadcrumb>
  <Breadcrumb href="..">
    {data.subject.emoji ? `${data.subject.emoji} ` : ''}
    {subject.shortName || subject.name}</Breadcrumb
  >
  <Breadcrumb>
    <span class="breadcrumb-icon">
      <svelte:component this={ICONS_DOCUMENT_TYPES.get(type)}></svelte:component>
    </span>
    {title} <span class="muted">&nbsp;({schoolYear})</span></Breadcrumb
  >
</Breadcrumbs>

<article class="document">
  <section class="dates-and-actions">
    <p class="dates">
      Année scolaire {schoolYear}–{schoolYear + 1}
      <br />
      {#if !isSameDay(createdAt, updatedAt)}
        Modifié le {formatDate(updatedAt)}
        {#if !uploader}
          Mis en ligne le {formatDate(createdAt)}
        {/if}
      {/if}
    </p>
    <div class="actions">
      {#if confirmingDelete}
        <p><strong>Sûr·e ?</strong></p>
        <ButtonInk
          on:click={async () => {
            try {
              await $zeus.mutate({
                deleteDocument: [{ id: document.id }, true],
              });
            } catch (error) {
              toasts.error(`Impossible de supprimer le document`, error?.toString());
              return;
            }

            toasts.success('Document supprimé');
            confirmingDelete = false;
            await goto('..');
          }}
          danger
          icon={IconDelete}>Confirmer</ButtonInk
        >
        <ButtonInk
          on:click={() => {
            confirmingDelete = false;
          }}
          icon={IconBack}>Annuler</ButtonInk
        >
      {:else}
        <ButtonShare text></ButtonShare>
        {#if $me?.admin || uploader?.uid === $me?.uid}
          <ButtonInk icon={IconEdit} href="./edit">Modifier</ButtonInk>
          <ButtonInk
            on:click={() => {
              confirmingDelete = true;
            }}
            danger
            icon={IconDelete}>Supprimer</ButtonInk
          >
        {/if}
      {/if}
    </div>
  </section>
  <h2>{title}</h2>
  <div class="description" data-user-html>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html descriptionHtml}
  </div>
  <div class:muted={emptyDocument} class="files">
    {#if emptyDocument}
      <p>Ce document n'a aucun fichier… Plutôt cringe</p>
    {:else if documentTypesWithSolutions.has(document.type)}
      {#if paperPaths.length > 0}
        <h3 class="typo-field-label">Sujets</h3>
        <ul>
          {#each paperPaths as path}
            <li>
              <a class="in-body" href="{PUBLIC_STORAGE_URL}{path}"
                >{path.split('/').at(-1)?.replace(/^\d+-/, '')}</a
              >
            </li>
          {/each}
        </ul>
      {/if}
      {#if solutionPaths.length > 0}
        <h3 class="typo-field-label">Corrigés</h3>
        <ul>
          {#each solutionPaths as path}
            <li>
              <a class="in-body" href="{PUBLIC_STORAGE_URL}{path}"
                >{path.split('/').at(-1)?.replace(/^\d+-/, '')}</a
              >
            </li>
          {/each}
        </ul>
      {/if}
    {:else}
      <h3 class="typo-field-label">Fichiers</h3>
      <ul>
        {#each [...paperPaths, ...solutionPaths] as path}
          <li>
            <a class="in-body" href="{PUBLIC_STORAGE_URL}{path}"
              >{path.split('/').at(-1)?.replace(/^\d+-/, '')}</a
            >
          </li>
        {:else}
          <li class="muted empty">Aucun fichier</li>
        {/each}
      </ul>
    {/if}
  </div>
  <div class="uploader-and-id">
    {#if uploader}
      <div class="uploader">
        <AvatarPerson
          role={`A mis en ligne le ${formatDate(createdAt)}`}
          href="/users/{uploader.uid}"
          {...uploader}
        ></AvatarPerson>
      </div>
    {/if}
    <div class="id typo-details">
      <code>{document.id.replace(/^doc:/, '')}</code>
    </div>
  </div>
</article>
<section class="comments">
  <h2>Commentaires</h2>

  <form
    on:submit={async () => {
      await addComment();
    }}
    class="new-comment"
  >
    <InputLongText
      submitShortcut
      label=""
      rows="2"
      rich
      bind:value={newComment.body}
      placeholder="Ajouter un commentaire"
    ></InputLongText>
    <ButtonSecondary submits>Commenter</ButtonSecondary>
  </form>

  <ul class="nobullet comments">
    {#each comments.edges.filter(({ node: { inReplyToId } }) => !inReplyToId) as { node }}
      <li class="comment">
        <CardComment
          bind:replyingTo
          on:reply={reply}
          on:edit={async ({ detail }) => {
            await editComment(node.id, detail);
          }}
          on:delete={async ({ detail: id }) => {
            await removeComment(id);
          }}
          {...node}
          replies={comments.edges
            .filter(({ node: { inReplyToId } }) => inReplyToId === node.id)
            .map((c) => c.node)}
        ></CardComment>
      </li>
    {/each}
  </ul>
</section>

<style lang="scss">
  .breadcrumb-icon {
    font-size: 0.9em;
  }

  .document {
    padding: 2rem;
    margin-top: 2rem;
    background: var(--card-bg, var(--muted-bg));
    border-radius: var(--radius-block);
  }

  .dates-and-actions {
    display: flex;
    flex-grow: 0;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-between;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.5rem;
    align-items: start;
    justify-content: center;
  }

  h2 {
    margin-top: 2rem;
    margin-bottom: 0.5rem;
  }

  h3 {
    margin-top: 1rem;
  }

  .document h2 {
    text-align: center;
  }

  .description {
    max-width: 600px;
    padding: 0 1rem;
    margin: 0 auto;
  }

  .uploader-and-id {
    display: flex;
    align-items: end;
    justify-content: space-between;
  }

  .uploader {
    margin-top: 2rem;
  }

  .uploader :global(.person) {
    padding: 0;
  }

  .id {
    margin-top: 1.5rem;
    margin-left: auto;
  }

  .id code {
    font-weight: normal;
  }

  .new-comment {
    display: flex;
    gap: 1rem;
    align-items: center;

    & :global(> :first-child) {
      flex-grow: 1;
    }
  }

  ul.comments {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;
  }
</style>
