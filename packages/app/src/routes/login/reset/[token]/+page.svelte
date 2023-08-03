<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Alert from '$lib/components/alerts/Alert.svelte';
  import Button from '$lib/components/buttons/Button.svelte';
  import FormInput from '$lib/components/inputs/FormInput.svelte';
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

{#if serverError}
  <Alert theme="danger">{serverError}</Alert>
{/if}

<form on:submit|preventDefault={usePasswordReset}>
  <FormInput label="Nouveau mot de passe">
    <input type="password" bind:value={newPassword} />
  </FormInput>

  <Button theme="primary" type="submit" {loading}>Changer</Button>
</form>
