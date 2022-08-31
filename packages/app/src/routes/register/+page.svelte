<script lang="ts">
  import Alert from '$lib/components/alerts/Alert.svelte';
  import Button from '$lib/components/buttons/Button.svelte';
  import FormCard from '$lib/components/cards/FormCard.svelte';
  import { fieldErrorsToFormattedError } from '$lib/errors.js';
  import { zeus } from '$lib/zeus';
  import type { ZodFormattedError } from 'zod';

  let email = '';
  $: args = { email };

  let success = false;
  let loading = false;
  let formErrors: ZodFormattedError<typeof args> | undefined;
  const register = async () => {
    if (loading) return;

    try {
      success = false;
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

      success = true;
    } catch (error: unknown) {
      formErrors = { _errors: [(error as Error).message ?? 'Une erreur est survenue'] };
    } finally {
      loading = false;
    }
  };
</script>

<div class="flex justify-center">
  {#if success}
    <Alert theme="success">
      <p>Compte créé, check tes mails bb</p>
    </Alert>
  {:else}
    <FormCard on:submit={register}>
      <svelte:fragment slot="header">S'inscrire</svelte:fragment>
      <Alert theme="danger" closed={(formErrors?._errors ?? []).length === 0} inline>
        {#each formErrors?._errors ?? [] as error}
          <strong>{error}. </strong>
        {/each}
      </Alert>
      <Alert theme="danger" closed={(formErrors?.email?._errors ?? []).length === 0} inline>
        {#each formErrors?.email?._errors ?? [] as error}
          <strong>{error}. </strong>
        {/each}
      </Alert>
      <p>
        <label>
          Adresse e-mail&nbsp;:
          <input type="email" bind:value={email} minlength="1" maxlength="255" required />
        </label>
      </p>
      <svelte:fragment slot="footer">
        <Button type="submit" theme="primary" {loading}>S'inscrire</Button>
      </svelte:fragment>
    </FormCard>
  {/if}
</div>

<style lang="scss">
  input {
    display: block;
    width: 100%;
  }
</style>
