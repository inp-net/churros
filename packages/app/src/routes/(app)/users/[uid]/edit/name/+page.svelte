<script lang="ts">
  import { page } from '$app/stores';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { loaded } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { toasts } from '$lib/toasts';
  import { UpdateUserRealName } from '../mutations';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageUserEditName } = data);

  let newFirstName: string;
  let newLastName: string;

  $: user = $PageUserEditName.data?.user;
  $: if (loaded(user?.firstName)) newFirstName ??= user?.firstName;
  $: if (loaded(user?.lastName)) newLastName ??= user?.lastName;
</script>

<MaybeError result={$PageUserEditName}>
  <div class="contents">
    <Alert theme="warning">
      <h2>Attention</h2>
      <p>Les changements de prénoms et noms de familles ne sont pas à prendre à la légère.</p>
      <p>
        Nous te donnon la possibilité d'en changer par toi-meme pour ne pas avoir à attendre des
        procédures administratives complexes pour (par exemple) un changement de nom suite à un
        changement d'identité de genre
      </p>
      <p>
        Les administrateur.ice.s sont notifié.e.s à chaque changement de nom, et tout abus manifeste
        sera lourdement sanctionné
      </p>
    </Alert>
    <form
      on:submit|preventDefault={async () => {
        const result = await mutate(UpdateUserRealName, {
          uid: $page.params.uid,
          firstName: newFirstName,
          lastName: newLastName,
        });
        toasts.mutation(result, 'updateUserProfile', 'Nom changé', 'Impossible de changer de nom');
      }}
    >
      <InputText required label="Prénom" bind:value={newFirstName}></InputText>
      <InputText required label="Nom de famille" bind:value={newLastName}></InputText>
      <section class="submit">
        <ButtonPrimary submits>Sauvegarder</ButtonPrimary>
      </section>
    </form>
  </div>
</MaybeError>

<style>
  .contents {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 0 1rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .submit {
    display: flex;
    justify-content: center;
  }
</style>
