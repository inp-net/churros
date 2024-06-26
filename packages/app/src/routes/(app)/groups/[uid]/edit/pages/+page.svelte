<script lang="ts">
  import { graphql } from '$houdini';
  import IconAdd from '~icons/mdi/plus';
  import IconEdit from '~icons/mdi/pencil-outline';
  import IconSee from '~icons/mdi/eye-outline';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import slugify from 'slugify';
  import Card from '$lib/components/Card.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { loaded, onceLoaded } from '$lib/loading';
  import InputText from '$lib/components/InputText.svelte';
  import type { PageData } from './$houdini';
  import { page } from '$app/stores';
  import { mutationResultToast } from '$lib/mutations';
  import { goto } from '$app/navigation';
  import { toasts } from '$lib/toasts';

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
            ...List_Pages_insert @allLists
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
      mutationResultToast('upsertPage', 'Page créée', 'Impossible de créer la page', result);
      if (result.data?.upsertPage && 'data' in result.data.upsertPage) {
        const page = result.data.upsertPage.data;
        if (page.group)
          {await goto(`/groups/${page.group.uid}/edit/pages/${page.path}`);}
        else {toasts.error(
            'Page créée, mais impossible de la retrouver dans la liste des pages du groupe',
          );}
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
    {@const pages = $PageGroupCustomPageList.data.group.pages}
    <ul class="nobullet">
      {#each pages.filter((p) => loaded(p.id)) as page (page.id)}
        {#if loaded(page.id)}
          <Card
            class="page-item"
            element="li"
            href={onceLoaded(page.path, (path) => `./${path}`, `#${page.id}`)}
          >
            <div class="text">
              <p><code>{page.path}</code></p>
              <h2><LoadingText value={page.title}>Lorem ipsum dolor sit amet</LoadingText></h2>
            </div>
            <div class="actions">
              {#if loaded(page.path)}
                <ButtonSecondary icon={IconEdit} href="./{page.path}">Modifier</ButtonSecondary>
                <ButtonSecondary icon={IconSee} href="../../{page.path}">Voir</ButtonSecondary>
              {/if}
            </div>
          </Card>
        {/if}
      {/each}
    </ul>
  {/if}
</div>

<style>
  h2 {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  ul :global(.card-content) {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
  }
</style>
