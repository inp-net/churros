<script>
  import Alert from '$lib/components/alerts/Alert.svelte';
  import Button from '$lib/components/buttons/Button.svelte';
  import { zeus } from '$lib/zeus';

  let email = '';
  let serverError = '';
  let loading = false;
  let sent = false;

  async function submit() {
    loading = true;
    try {
      const { createPasswordReset } = await $zeus.mutate({
        createPasswordReset: [
          {
            email,
          },
          {
            __typename: true,
            '...on Error': {
              message: true,
            },
            '...on MutationCreatePasswordResetSuccess': {
              data: true,
            },
          },
        ],
      });
      if (createPasswordReset.__typename === 'Error') {
        serverError = createPasswordReset.message;
        sent = false;
      } else {
        serverError = '';
        sent = true;
      }
    } finally {
      loading = false;
    }
  }
</script>

<h1>Réinitialisez votre mot de passe</h1>
<p>Nous allons vous envoyer un mail contenant un lien.</p>
<p>Celui-ci vous amènera sur une page sur laquelle vous pourrez choisir un nouveau mot de passe.</p>

<form on:submit|preventDefault={submit}>
  <label>
    Adresse e-mail
    <input type="email" bind:value={email} required />
  </label>

  <Button theme="primary" type="submit" {loading}>Envoyer</Button>
</form>

{#if serverError}
  <Alert theme="danger">{serverError}</Alert>
{:else if sent}
  <Alert theme="success">Mail envoyé à {email}</Alert>
{/if}
