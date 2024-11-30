<script lang="ts">
  import { goto, pushState } from '$app/navigation';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import { mutationErrorMessages, mutationSucceeded } from '$lib/errors';
  import { type MaybeLoading } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { route } from '$lib/ROUTES';
  import { page } from '$app/stores';
  import { graphql } from '$houdini';

  const DeletePost = graphql(`
    mutation DeletePost($id: LocalID!) {
      deleteArticle(id: $id) {
        ...MutationErrors
        ... on MutationDeleteArticleSuccess {
          data {
            id
          }
        }
      }
    }
  `);

  export let postId: MaybeLoading<string>;

  let implicitClose: () => void;
  let open: () => void;
  $: if ($page.state.NAVTOP_DELETING) open();
  else implicitClose?.();

  let deletionResult:
    | {
        type: 'danger' | 'warning' | 'success';
        messages: string[];
      }
    | undefined;

  async function deletePost() {
    const result = await mutate(DeletePost, { id: postId });
    if (!result) return;
    if (mutationSucceeded('deleteArticle', result)) {
      deletionResult = {
        type: 'success',
        messages: ['Post supprimé'],
      };
      await goto(route('/'));
    } else {
      deletionResult = {
        type: 'danger',
        messages: mutationErrorMessages('deleteArticle', result),
      };
    }
  }
</script>

<ModalOrDrawer
  bind:open
  bind:implicitClose
  let:close
  on:close={() => {
    deletionResult = undefined;
    pushState('', { NAVTOP_DELETING: false });
  }}
>
  <div class="contents">
    <h1>Es-tu sûr·e ?</h1>
    <p>Il est impossible de revenir en arrière</p>
    {#if deletionResult}
      <Alert theme={deletionResult.type}>
        {#each deletionResult.messages as message}
          <p>{message}</p>
        {/each}
      </Alert>
    {/if}
    <section class="actions">
      {#if deletionResult}
        <ButtonPrimary on:click={close}>OK</ButtonPrimary>
      {:else}
        <ButtonSecondary on:click={close}>Annuler</ButtonSecondary>
        <ButtonSecondary danger on:click={deletePost}>Supprimer</ButtonSecondary>
      {/if}
    </section>
  </div>
</ModalOrDrawer>

<style>
  .contents {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    padding: 2rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.5rem;
    align-items: center;
    justify-content: center;
  }
</style>
