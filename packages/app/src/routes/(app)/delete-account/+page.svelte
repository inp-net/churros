<script lang="ts">
  import { goto } from '$app/navigation';
  import { graphql } from '$houdini';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { LoadingText } from '$lib/loading';
  import { mutateAndToast } from '$lib/mutations';
  import { route } from '$lib/ROUTES';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageDeleteAccount } = data);

  const DeleteAccount = graphql(`
    mutation DeleteAccount {
      deleteUser {
        ...MutationErrors
        ... on MutationDeleteUserSuccess {
          data {
            uid
          }
        }
      }
    }
  `);

  let myUid = '';
  let step: 'initial' | 'confirm-uid' = 'initial';
</script>

<MaybeError result={$PageDeleteAccount} let:data={{ me }}>
  <div class="contents">
    <h1>Supprimer ton compte</h1>
    {#if step === 'initial'}
      <p>Es-tu sûre, <LoadingText value={me.fullName} /> ?</p>
      {#if me.deletionConsequences.length > 0}
        <p>Supprimer ton compte supprimerait...</p>
        <ul>
          {#each me.deletionConsequences as consequence}
            <LoadingText tag="li" value={consequence} />
          {/each}
        </ul>
      {/if}
    {:else}
      <p>Rentre ton identifiant pour confirmer la suppression</p>
      <InputText label="Identifiant" bind:value={myUid} />
    {/if}
    <nav>
      <ButtonSecondary href={route('/settings')}>Non, annuler</ButtonSecondary>
      <ButtonSecondary
        disabled={step === 'confirm-uid' && myUid !== me.uid}
        danger
        on:click={async () => {
          if (step === 'initial') {
            step = 'confirm-uid';
            return;
          }

          const ok = await mutateAndToast(DeleteAccount, null, {
            success: 'Compte supprimé 🫡',
            error: 'Erreur lors de la suppression du compte',
          });
          if (ok) {
            window.localStorage.clear();
            window.sessionStorage.clear();
            setTimeout(() => goto(route('/logout')), 2000);
          }
        }}>Oui</ButtonSecondary
      >
    </nav>
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }
</style>
