<script>
  import Alert from '$lib/components/Alert.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputText from '$lib/components/InputText.svelte';
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

<div class="content">
  <h1>Réinitialisez votre mot de passe</h1>

  <p>
    Nous allons vous envoyer un mail contenant un lien. Celui-ci vous amènera sur une page sur
    laquelle vous pourrez choisir un nouveau mot de passe.
  </p>

  {#if sent || serverError}
    <div class="status">
      {#if serverError}
        <Alert theme="danger">{serverError}</Alert>
      {:else if sent}
        <Alert theme="success">Mail envoyé à {email}</Alert>
      {/if}
    </div>
  {/if}

  <form on:submit|preventDefault={submit}>
    <InputText label="Votre adresse e-mail" required type="email" bind:value={email} />

    <section class="submit">
      <ButtonPrimary submits {loading}>Envoyer</ButtonPrimary>
    </section>
  </form>
</div>

<style>
  .content {
    max-width: 600px;
    margin: 0 auto;
  }
  h1,
  p {
    text-align: center;
  }

  form {
    margin-top: 2rem;
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
  }

  .submit {
    display: flex;
    justify-content: center;
  }

  .status {
    margin-top: 2rem;
  }
</style>
