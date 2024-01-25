<script lang="ts">
  import { zeus } from '$lib/zeus';
  import InputText from '$lib/components/InputText.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import Alert from '$lib/components/Alert.svelte';
  import InputCheckbox from './InputCheckbox.svelte';

  export let user: {
    uid: string;
  };
  let resetPasswordLoading = false;
  let oldPassword = '';
  let newPassword = '';
  let newPasswordConfirmation = '';
  let resetPasswordError: string | undefined = undefined;
  let disconnectAll = false;

  const resetPassword = async () => {
    if (resetPasswordLoading) return;
    if (newPassword !== newPasswordConfirmation) {
      resetPasswordError = 'Les mots de passe ne correspondent pas';
      return;
    }

    try {
      resetPasswordLoading = true;
      const { resetPassword } = await $zeus.mutate({
        resetPassword: [
          {
            uid: user.uid,
            oldPassword,
            newPassword,
            disconnectAll,
          },
          {
            '__typename': true,
            '...on Error': { message: true },
            '...on MutationResetPasswordSuccess': { data: true },
          },
        ],
      });
      if (resetPassword.__typename === 'Error') {
        resetPasswordError = resetPassword.message;
      } else {
        resetPasswordError = '';
        oldPassword = '';
        newPassword = '';
        newPasswordConfirmation = '';
      }
    } finally {
      resetPasswordLoading = false;
    }
  };
</script>

<form on:submit|preventDefault={resetPassword}>
  <h2>Changer de mot de passe</h2>
  {#if resetPasswordError}
    <Alert theme="danger">{resetPasswordError}</Alert>
  {:else if resetPasswordError === ''}
    <Alert theme="success">Mot de passe changé avec succès</Alert>
  {/if}
  <InputText type="password" label="Mot de passe actuel" bind:value={oldPassword} required />
  <InputText
    type="password"
    label="Nouveau mot de passe"
    bind:value={newPassword}
    required
    minlength={8}
  />
  <InputText
    type="password"
    label="Confirmer le nouveau mot de passe"
    bind:value={newPasswordConfirmation}
    minlength={8}
    required
  />
  <InputCheckbox label="Se deconnecter de tous les appareils" bind:value={disconnectAll} />
  <section class="submit">
    <ButtonSecondary submits loading={resetPasswordLoading}>
      Changer de mot de passe
    </ButtonSecondary>
  </section>
</form>

<style>
  form {
    display: flex;
    flex-flow: column wrap;
    gap: 0.5rem;
  }

  .submit {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }
</style>
