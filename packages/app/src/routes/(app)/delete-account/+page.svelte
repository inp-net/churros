<script lang="ts">
  import { goto } from '$app/navigation';
  import { env } from '$env/dynamic/public';
  import { graphql } from '$houdini';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import LoadingScreen from '$lib/components/LoadingScreen.svelte';
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
  let loggingOut = false;
  let deleting = false;
</script>

<MaybeError result={$PageDeleteAccount} let:data={{ me }}>
  <div class="contents">
    {#if loggingOut}
      <LoadingScreen title="Déconnexion…" />
    {:else if step === 'initial'}
      <p>Es-tu sûre de vouloir supprimer ton compte, <LoadingText value={me.fullName} /> ?</p>
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
    {#if !loggingOut}
      <nav>
        <ButtonSecondary href={route('/settings')}>Non, annuler</ButtonSecondary>
        <ButtonSecondary
          loading={deleting}
          disabled={step === 'confirm-uid' && myUid !== me.uid}
          danger
          on:click={async () => {
            if (step === 'initial') {
              step = 'confirm-uid';
              return;
            }

            deleting = true;
            const ok = await mutateAndToast(DeleteAccount, null, {
              success: 'Compte supprimé 🫡',
              error: 'Erreur lors de la suppression du compte',
            });
            deleting = false;
            if (ok) {
              window.localStorage.clear();
              window.sessionStorage.clear();
              loggingOut = true;
              setTimeout(
                () =>
                  goto(
                    route('/logout', {
                      userWasDeleted: '1',
                    }),
                  ),
                2000,
              );
            }
          }}>Oui</ButtonSecondary
        >
      </nav>

      <footer>
        <p>Quelque chose ne va pas?</p>
        <p>
          Tu peux toujours contacter le support en écrivant à
          <a href="mailto:{env.PUBLIC_SUPPORT_EMAIL}">{env.PUBLIC_SUPPORT_EMAIL}</a>
        </p>
      </footer>
    {/if}
  </div>
</MaybeError>

<style>
  .contents {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
    padding: 0 1rem;
    text-align: center;
  }

  footer {
    margin: 4rem 3rem;
    text-align: center;
  }
</style>
