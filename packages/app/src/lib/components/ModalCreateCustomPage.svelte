<script lang="ts">
  import { goto } from '$app/navigation';
  import { graphql } from '$houdini';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { toasts } from '$lib/toasts';
  import slugify from 'slugify';
  import IconReset from '~icons/mdi/refresh';

  const CreatePage = graphql(`
    mutation CreateCustomPage(
      $group: String
      $studentAssociation: String
      $path: String!
      $title: String!
    ) {
      upsertPage(
        body: ""
        title: $title
        path: $path
        group: $group
        studentAssociation: $studentAssociation
      ) {
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
            studentAssociation {
              uid
            }
          }
        }
      }
    }
  `);

  export let element: HTMLDialogElement;
  export let parentResource: 'group' | 'studentAssociation' = 'group';
  export let parentResourceUid: string;

  let path = '';
  let title = '';
  let pathWasUserEdited = false;

  $: suggestedPath = slugify(title).toLowerCase();
  $: if ((title && !pathWasUserEdited) || !path) path = suggestedPath;
</script>

<Modal bind:element>
  <h1>Créer une nouvelle page</h1>

  <form
    on:submit|preventDefault={async () => {
      const result = await CreatePage.mutate({
        [parentResource]: parentResourceUid,
        path: path,
        title: title,
      });
      toasts.mutation(result, 'upsertPage', 'Page créée', 'Impossible de créer la page');
      if (result.data?.upsertPage && 'data' in result.data.upsertPage) {
        const page = result.data.upsertPage.data;
        const parentResourceUid = page[parentResource]?.uid;
        if (parentResourceUid) await goto(`/groups/${parentResourceUid}/edit/pages/${page.path}`);
        else toasts.error('Page créée, mais impossible de la retrouver dans la liste des pages');
      }
    }}
  >
    <InputText bind:value={title} label="Titre" />
    <InputText
      bind:value={path}
      on:input={() => {
        pathWasUserEdited = true;
      }}
      label="Chemin"
      actionIcon={path !== suggestedPath ? IconReset : undefined}
      on:action={() => {
        path = suggestedPath;
        pathWasUserEdited = false;
      }}
    />
    <section class="submit">
      <ButtonSecondary
        on:click={() => {
          title = '';
          path = '';
          element.close();
        }}>Annuler</ButtonSecondary
      >
      <ButtonPrimary submits>Créer</ButtonPrimary>
    </section>
  </form>
</Modal>

<style>
  section.submit {
    display: flex;
    margin-top: 1rem;
    justify-content: space-between;
    align-items: center;
  }
</style>
