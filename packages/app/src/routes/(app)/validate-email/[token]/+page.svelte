<script lang="ts">
  import { graphql } from '$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import { route } from '$lib/ROUTES';
  import { toasts } from '$lib/toasts';
  import type { PageData } from './$types';

  let email = '';

  export let data: PageData;
  export let loading = false;

  async function rerequestValidation() {
    loading = true;
    toasts.mutation(
      await graphql(`
        mutation RequestEmailChangeAgain($email: Email!, $callbackURL: URL!) {
          requestEmailChange(email: $email, callbackURL: $callbackURL) {
            ...MutationErrors
            ... on MutationRequestEmailChangeSuccess {
              data {
                ...List_EmailChangeRequests_insert
              }
            }
          }
        }
      `).mutate({ email, callbackURL: new URL(route('/validate-email/[token]', '[token]')) }),
      'requestEmailChange',
      "Si l'adresse fournie existe, tu devrais recevoir un e-mail de validation dans quelques instants.",
      "Erreur lors de l'envoi de l'e-mail de validation",
    );
    loading = false;
  }
</script>

<div class="content">
  <h1>Oops!</h1>

  <p>Ce lien de validation d'adresse e-mail n'est plus valide.</p>

  <Alert theme="danger">
    {data.message}
  </Alert>

  <form on:submit|preventDefault={rerequestValidation}>
    <h2>Renvoyer une demande</h2>
    <InputText label="Adresse e-mail" type="email" bind:value={email}></InputText>
    <section class="submit">
      <ButtonPrimary {loading} submits>Envoyer</ButtonPrimary>
    </section>
  </form>
</div>

<style>
  .content {
    max-width: 600px;
    margin: 0 auto;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .submit {
    text-align: center;
  }
</style>
