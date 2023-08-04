<script lang="ts">
  import Alert from '$lib/components/Alert.svelte';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$types';

  let email = '';

  export let data: PageData;

  async function rerequestValidation() {
    await $zeus.mutate({
      requestEmailChange: [
        { email },
        {
          __typename: true,
          '...on Error': { message: true },
          '...on MutationRequestEmailChangeSuccess': { data: true },
        },
      ],
    });
  }
</script>

<h1>Oops!</h1>

<p>Ce lien de validation d'adresse e-mail n'est plus valide.</p>

<Alert theme="danger">
  {data.message}
</Alert>

<form on:submit|preventDefault={rerequestValidation}>
  <input type="email" bind:value={email} />
  <button type="submit" />
</form>
