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

  $: ({ PageGroupCustomPageEdit } = data);
  const Update = graphql(`
    mutation UpdateGroupPage($uid: String!, $page: String!, $title: String!, $body: String!) {
      upsertPage(body: $body, group: $uid, path: $page, title: $title) {
        ... on Error {
          message
        }
        ... on ZodError {
          fieldErrors {
            path
            message
          }
        }
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
  {#if $PageGroupCustomPageEdit.data?.group.page}
    {@const pageItem = $PageGroupCustomPageEdit.data.group.page}
    <FormPage
      bind:snapshot
      {pageItem}
      saveChanges={async ({ title, body }) => {
        const result = await Update.mutate({
          uid: $page.params.uid,
          page: $page.params.page,
          title,
          body,
        });
        toasts.mutation(
          'upsertPage',
          'Modifications enregistrées',
          'Impossible de sauvegarder les modifications',
          result,
        );
      }}
    >
      <div slot="before-title"></div>
    </FormPage>
  {:else if $PageGroupCustomPageEdit.errors}
    <h1>Oops!</h1>
    <ul>
      {#each $PageGroupCustomPageEdit.errors as { message }}
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
