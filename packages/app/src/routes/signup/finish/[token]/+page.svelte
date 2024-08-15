<script lang="ts">
  import { ButtonSecondary, MaybeError } from '$lib/components';
  import Alert from '$lib/components/Alert.svelte';
  import { route } from '$lib/ROUTES';
  import type { PageData } from './$houdini';

  export let data: PageData;
</script>

<div class="contents">
  <MaybeError result={data} let:data={{ completeSignup }}>
    {#if completeSignup.needsManualValidation}
      <Alert theme="warning">
        Ton compte n'est pas encore actif. L'équipe administrative de ton AE doit encore valider ta
        demande d'inscription. Un peu de patience ;)
      </Alert>
    {:else}
      <Alert theme="success">
        Compte créé! <ButtonSecondary href={route('/welcome')}>Par ici</ButtonSecondary>
      </Alert>
    {/if}
  </MaybeError>

  <div class="go-home">
    <ButtonSecondary href={route('/')}>Accueil</ButtonSecondary>
  </div>
</div>

<style>
  .contents {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
  }

  .go-home {
    margin-top: 3rem;
  }
</style>
