<svelte:options accessors={true} />

<script lang="ts">
  import { page } from '$app/stores';
  import { graphql } from '$houdini';
  import FormPage from '$lib/components/FormPage.svelte';
  import { toasts } from '$lib/toasts';
  import type { Snapshot } from '@sveltejs/kit';
  import type { PageData } from './$houdini';
  export let data: PageData;

  export let snapshot: Snapshot;

  $: ({ PageStudentAssociationCustomPageEdit } = data);
  const Update = graphql(`
    mutation UpdateStudentAssociationPage(
      $uid: String!
      $page: String!
      $title: String!
      $body: String!
    ) {
      upsertPage(body: $body, studentAssociation: $uid, path: $page, title: $title) {
        ...MutationErrors
        ... on MutationUpsertPageSuccess {
          data {
            bodyHtml
            body
            title
          }
        }
      }
    }
  `);
</script>

<div class="content">
  {#if $PageStudentAssociationCustomPageEdit.data?.studentAssociation.page}
    {@const pageItem = $PageStudentAssociationCustomPageEdit.data.studentAssociation.page}
    <FormPage
      bind:snapshot
      {pageItem}
      saveChanges={async ({ title, body }) => {
        const result = await Update.mutate({
          title,
          body,
          uid: $page.params.uid,
          page: $page.params.page,
        });
        toasts.mutation(
          result,
          'upsertPage',
          'Modifications enregistrées',
          'Impossible de sauvegarder les modifications',
        );
      }}
    ></FormPage>
  {:else if $PageStudentAssociationCustomPageEdit.errors}
    <h1>Oops!</h1>
    <ul>
      {#each $PageStudentAssociationCustomPageEdit.errors as { message }}
        <li>{message}</li>
      {/each}
    </ul>
  {:else}
    Cette page n'existe pas (ou plus)
  {/if}
</div>

<style>
  h1 {
    display: flex;
    column-gap: 1rem;
    align-items: center;
  }

  .content {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
  }
</style>
