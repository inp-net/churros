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

    // Data required to potentially re-request an email change: we need to know for who the email change is. We assume its the logged-in user.
    const meResult = await graphql(`
      query ValidateEmailFailure {
        me: assertMe {
          uid
        }
      }
    `).fetch();

    if (!meResult.data) {
      toasts.error(
        "Impossible de re-demander une validation d'email",
        meResult.errors?.map((e) => e.message).join('; ') ?? 'Erreur inconnue',
      );
      loading = false;
      return;
    }

    toasts.mutation(
      await graphql(`
        mutation RequestEmailChangeAgain($email: Email!, $callbackURL: URL!, $user: UID!) {
          requestEmailChange(newEmail: $email, callbackURL: $callbackURL, user: $user) {
            ...MutationErrors
            ... on MutationRequestEmailChangeSuccess {
              data {
                ...List_EmailChangeRequests_insert
              }
            }
          }
        }
      `).mutate({
        email,
        callbackURL: new URL(route('/validate-email/[token]', '[token]')),
        user: meResult.data.me.uid,
      }),
      'requestEmailChange',
      "Si l'adresse fournie existe, tu devrais recevoir un e-mail de validation dans quelques instants.",
      "Erreur lors de l'envoi de l'e-mail de validation",
    );
    loading = false;
  }
</script>

<div class="content">
  <Alert theme="danger">
    <h1>Oops!</h1>
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
    display: flex;
    flex-direction: column;
    gap: 2rem 0;
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
