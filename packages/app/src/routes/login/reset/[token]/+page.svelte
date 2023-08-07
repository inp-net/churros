<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import { zeus } from '$lib/zeus';

  let newPassword = '';
  let serverError = '';
  let loading = false;

  async function usePasswordReset() {
    loading = true;
    const { usePasswordReset } = await $zeus.mutate({
      usePasswordReset: [
        {
          newPassword,
          token: $page.params.token,
        },
        {
          __typename: true,
          '...on Error': {
            message: true,
          },
          '...on MutationUsePasswordResetSuccess': {
            data: true,
          },
        },
      ],
    });
    loading = false;

    if (usePasswordReset.__typename === 'Error') {
      serverError = usePasswordReset.message;
      return;
    }

    serverError = '';
    await goto('/login');
  }
</script>

<div class="content">
  <h1>Choisir mon nouveau mot de passe</h1>
  {#if serverError}
    <Alert theme="danger">{serverError}</Alert>
  {/if}

  <form on:submit|preventDefault={usePasswordReset}>
    <InputText label="Nouveau mot de passe" type="password" bind:value={newPassword} />

    <section class="submit"><ButtonPrimary submits {loading}>Changer</ButtonPrimary></section>
  </form>
</div>

<style>
  h1 {
    text-align: center;
  }

  .content {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  form {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
  }

  .submit {
    display: flex;
    justify-content: center;
  }
</style>
