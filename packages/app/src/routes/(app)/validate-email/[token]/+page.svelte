<script lang="ts">
  import Alert from '$lib/components/Alert.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import { toasts } from '$lib/toasts';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$types';

  let email = '';

  export let data: PageData;
  export let loading = false;

  async function rerequestValidation() {
    loading = true;
    await $zeus.mutate({
      requestEmailChange: [
        { email },
        {
          '__typename': true,
          '...on Error': { message: true },
          '...on MutationRequestEmailChangeSuccess': { data: true },
        },
      ],
    });
    toasts.info(
      'E-mail envoyé !',
      "Si l'adresse fournie existe, tu devrais recevoir un e-mail de validation dans quelques instants.",
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
