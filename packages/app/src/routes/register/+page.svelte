<script lang="ts">
  import { page } from '$app/stores';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputText from '$lib/components/InputText.svelte';

  import { fieldErrorsToFormattedError } from '$lib/errors.js';
  import { zeus } from '$lib/zeus';
  import type { ZodFormattedError } from 'zod';

  let email = $page.url.searchParams.get('email') ?? '';
  $: args = { email };

  let result: boolean | undefined;
  let loading = false;
  let formErrors: ZodFormattedError<typeof args> | undefined;
  const register = async () => {
    if (loading) return;

    try {
      result = undefined;
      loading = true;
      formErrors = undefined;
      const { startRegistration } = await $zeus.mutate({
        startRegistration: [
          args,
          {
            __typename: true,
            '...on MutationStartRegistrationSuccess': { data: true },
            '...on Error': { message: true },
            '...on ZodError': { message: true, fieldErrors: { path: true, message: true } },
          },
        ],
      });

      if (startRegistration.__typename === 'ZodError') {
        formErrors = fieldErrorsToFormattedError(startRegistration.fieldErrors);
        return;
      }

      if (startRegistration.__typename === 'Error') {
        formErrors = { _errors: [startRegistration.message] };
        return;
      }

      result = startRegistration.data;
    } catch (error: unknown) {
      formErrors = { _errors: [(error as Error).message ?? 'Une erreur est survenue'] };
    } finally {
      loading = false;
    }
  };
</script>

<h1>Inscription</h1>

{#if result === undefined}
  <form title="S'inscrire" on:submit|preventDefault={register}>
    <Alert theme="danger" closed={(formErrors?._errors ?? []).length === 0} inline>
      <strong>{(formErrors?._errors ?? []).join(' ')} </strong>
    </Alert>
    <InputText
      label="Adresse e-mail universitaire"
      hint="Elle finit par @etu.[ecole].fr."
      errors={formErrors?.email?._errors}
      type="email"
      bind:value={email}
      required
    />

    <section class="submit">
      <ButtonPrimary submits {loading}>S'inscrire</ButtonPrimary>
    </section>
  </form>
{:else if result}
  <Alert theme="success">
    <h3>Demande enregistrée&nbsp;!</h3>
    <p>Cliquez sur le lien que vous avez reçu par email pour continuer votre inscription.</p>
    <p><a href="/">Retourner à l'accueil.</a></p>
  </Alert>
{:else}
  <Alert theme="danger">
    <h3>Une erreur est survenue…</h3>
    <p>Veuillez recommencer plus tard.</p>
    <p><a href="/">Retourner à l'accueil.</a></p>
  </Alert>
{/if}

<style>
  h1 {
    margin-bottom: 2rem;
    text-align: center;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 400px;
    margin: 0 auto;
  }

  form .submit {
    display: flex;
    justify-content: center;
  }
</style>
