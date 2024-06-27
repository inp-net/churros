<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$houdini';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import ListManageCustomPages from '$lib/components/ListManageCustomPages.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { toasts } from '$lib/toasts';
  import slugify from 'slugify';
  import IconAdd from '~icons/mdi/plus';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageGroupCustomPageList } = data);

  const CreatePage = graphql(`
    mutation CreateGroupPage($group: String!, $path: String!, $title: String!) {
      upsertPage(body: "", title: $title, path: $path, group: $group) {
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
            path
            group {
              uid
            }
          }
        }
      }
    }
  `);

  export let modalNewPage: HTMLDialogElement;

  // let newPage = { path: '', title: '' };
  let newPagePath = '';
  let newPageTitle = '';
  $: if (newPageTitle) newPagePath = slugify(newPageTitle);
</script>

<Modal bind:element={modalNewPage}>
  <h1>Créer une nouvelle page</h1>

  <form
    on:submit|preventDefault={async () => {
      const result = await CreatePage.mutate({
        group: $page.params.uid,
        path: newPagePath,
        title: newPageTitle,
      });
      toasts.mutation('upsertPage', 'Page créée', 'Impossible de créer la page', result);
      if (result.data?.upsertPage && 'data' in result.data.upsertPage) {
        const page = result.data.upsertPage.data;
        if (page.group) {
          await goto(`/groups/${page.group.uid}/edit/pages/${page.path}`);
        } else {
          toasts.error(
            'Page créée, mais impossible de la retrouver dans la liste des pages du groupe',
          );
        }
      }
    }}
  >
    <InputText bind:value={newPageTitle} label="Titre" />
    <InputText bind:value={newPagePath} label="Chemin" />
    <section class="submit">
      <ButtonPrimary submits>Créer</ButtonPrimary>
    </section>
  </form>
</Modal>

<div class="content">
  <h2>
    Pages du groupe

    <ButtonSecondary icon={IconAdd} on:click={() => modalNewPage.showModal()}
      >Créer une page</ButtonSecondary
    >
  </h2>
  {#if $PageGroupCustomPageList.data?.group.pages}
    {@const group = $PageGroupCustomPageList.data.group}
    <ListManageCustomPages {group}></ListManageCustomPages>
  {/if}
</div>

<style>
  h2 {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
