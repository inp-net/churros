<script lang="ts">
  import { PendingValue } from '$houdini';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import ModalDeleteCustomPage from '$lib/components/ModalDeleteCustomPage.svelte';
  import { formatDate } from '$lib/dates';
  import { allLoaded, loaded, loading } from '$lib/loading';
  import { subDays } from 'date-fns';
  import IconDelete from '~icons/mdi/delete-outline';
  import IconEdit from '~icons/mdi/pencil-outline';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageStudentAssociationCustomPage } = data);

  let openDeletionConfirmation: () => void;
</script>

<svelte:head>
  {#if $PageStudentAssociationCustomPage.data?.studentAssociation.page && loaded($PageStudentAssociationCustomPage.data.studentAssociation.page.title)}
    <title>{$PageStudentAssociationCustomPage.data.studentAssociation.page.title}</title>
  {/if}
</svelte:head>

<div class="content">
  {#if $PageStudentAssociationCustomPage.data?.studentAssociation.page}
    {@const page = $PageStudentAssociationCustomPage.data.studentAssociation.page}
    <ModalDeleteCustomPage bind:openDeletionConfirmation customPage={page}></ModalDeleteCustomPage>
    <h1>
      <ButtonBack></ButtonBack>
      <LoadingText value={page.title}>Lorem ipsum dolor sit amet, consequitur jsp</LoadingText>
    </h1>

    <section class="metadata">
      <p class="muted">
        Dernière modification le <LoadingText
          value={loaded(page.updatedAt) ? formatDate(page.updatedAt) : PendingValue}
        >
          {formatDate(subDays(new Date(), 5))}
        </LoadingText>
        {#if loading(page.canBeEdited, false) && allLoaded(page.lastAuthor) && page.lastAuthor}
          par <AvatarPerson inline small href="/users/{page.lastAuthor.uid}" {...page.lastAuthor}
          ></AvatarPerson>
        {/if}
      </p>
    </section>

    <div data-user-html>
      {#if loaded(page.bodyHtml)}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html page.bodyHtml}
      {:else}
        <LoadingText lines={20}></LoadingText>
      {/if}
    </div>

    <section class="actions">
      <ButtonShare></ButtonShare>
      {#if loaded(page.studentAssociation.uid) && loaded(page.path) && loading(page.canBeEdited, false)}
        <ButtonGhost
          help="Modifier"
          href="/student-associations/{page.studentAssociation.uid}/edit/pages/{page.path}"
        >
          <IconEdit></IconEdit>
        </ButtonGhost>
        <ButtonGhost help="Supprimer" on:click={() => openDeletionConfirmation()}>
          <IconDelete></IconDelete>
        </ButtonGhost>
      {/if}
    </section>
  {:else if $PageStudentAssociationCustomPage.errors}
    <h1>Oops!</h1>
    <ul>
      {#each $PageStudentAssociationCustomPage.errors as { message }}
        <li>{message}</li>
      {/each}
    </ul>
  {:else}
    Cette page n'existe pas (ou plus)
  {/if}
</div>

<style>
  .content {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
  }

  h1 {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.5rem;
    align-items: center;
  }

  section.actions {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    align-items: center;
    margin-top: 1rem;
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
</style>
