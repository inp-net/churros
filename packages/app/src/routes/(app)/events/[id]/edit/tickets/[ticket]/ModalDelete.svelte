<script lang="ts">
  import { goto, pushState } from '$app/navigation';
  import { page } from '$app/stores';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import { mutationErrorMessages } from '$lib/errors';
  import { type MaybeLoading } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { route } from '$lib/ROUTES';
  import { DeleteTicket } from './mutations';

  export let ticketId: MaybeLoading<string>;

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

  async function deleteTicket() {
    const result = await mutate(DeleteTicket, { ticket: ticketId });
    if (!result) return;
    if (result.data?.deleteTicket.__typename === 'MutationDeleteTicketSuccess') {
      if (result.data.deleteTicket.softDeleted) {
        deletionResult = {
          type: 'warning',
          messages: [result.data.deleteTicket.softDeleted],
        };
      } else {
        deletionResult = {
          type: 'success',
          messages: ['Évènement supprimé'],
        };
        await goto(route('/events'));
      }
    } else {
      deletionResult = {
        type: 'danger',
        messages: mutationErrorMessages('deleteTicket', result),
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
        <ButtonSecondary danger on:click={deleteTicket}>Supprimer</ButtonSecondary>
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
