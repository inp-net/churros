<script lang="ts">
  import { page } from '$app/stores';
  import Alert from '$lib/components/alerts/Alert.svelte';
  import Button from '$lib/components/buttons/Button.svelte';
  import FormCard from '$lib/components/cards/FormCard.svelte';
  import FormInput from '$lib/components/inputs/FormInput.svelte';
  import { fieldErrorsToFormattedError } from '$lib/errors.js';
  import { zeus } from '$lib/zeus.js';
  import type { ZodFormattedError } from 'zod';
  import type { PageData } from './$types';

  export let data: PageData;

  let {
    address,
    phone,
    birthday,
    firstName,
    graduationYear = new Date().getFullYear() + 3,
    lastName,
    majorId,
  } = data.userCandidate;

  const asDate = (x: unknown) => (x as null | Date) && new Date(x as Date);
  const asInput = (x: unknown) => x as HTMLInputElement;

  $: token = $page.url.searchParams.get('token')!;
  $: args = {
    token,
    address,
    birthday,
    firstName,
    graduationYear,
    lastName,
    majorId: majorId!,
    phone,
  };

  let loading = false;
  let formErrors: ZodFormattedError<typeof args> | undefined;
  const register = async () => {
    if (loading) return;

    try {
      loading = true;
      const { completeRegistration } = await $zeus.mutate({
        completeRegistration: [
          args,
          {
            __typename: true,
            '...on MutationCompleteRegistrationSuccess': { data: true },
            '...on Error': { message: true },
            '...on ZodError': { message: true, fieldErrors: { path: true, message: true } },
          },
        ],
      });

      if (completeRegistration.__typename === 'ZodError') {
        formErrors = fieldErrorsToFormattedError(completeRegistration.fieldErrors);
        return;
      }

      if (completeRegistration.__typename === 'Error') {
        formErrors = { _errors: [completeRegistration.message] };
        return;
      }
    } catch (error: unknown) {
      formErrors = { _errors: [(error as Error).message ?? 'Une erreur est survenue'] };
    } finally {
      loading = false;
    }
  };
</script>

<FormCard large title="Finaliser mon inscription" on:submit={register}>
  <Alert theme="danger" closed={(formErrors?._errors ?? []).length === 0} inline>
    <strong>{(formErrors?._errors ?? []).join(' ')}</strong>
  </Alert>
  <p class="grid gap-4 desktop:grid-cols-2">
    <FormInput label="Prénom :" errors={formErrors?.firstName?._errors}>
      <input type="text" bind:value={firstName} required />
    </FormInput>
    <FormInput label="Nom de famille :" errors={formErrors?.lastName?._errors}>
      <input type="text" bind:value={lastName} required />
    </FormInput>
  </p>
  <p class="grid gap-4 desktop:grid-cols-2">
    <FormInput label="Filière :" errors={formErrors?.majorId?._errors}>
      <select bind:value={majorId} required>
        {#each data.schoolGroups as { majors, names }}
          <optgroup label={names.join(', ')}>
            {#each majors as { id, name }}
              <option value={id}>{name}</option>
            {/each}
          </optgroup>
        {/each}
      </select>
    </FormInput>
    <FormInput
      label="Promotion :"
      hint="Si c'est votre première année, vous êtes de la promotion {new Date().getFullYear() +
        3}."
      errors={formErrors?.graduationYear?._errors}
    >
      <input type="number" bind:value={graduationYear} size="4" required />
    </FormInput>
  </p>
  <hr />
  <p>Les champs suivant sont facultatifs.</p>
  <p class="grid gap-4 grid-cols-2">
    <FormInput label="Date de naissance :" errors={formErrors?.birthday?._errors}>
      <input
        type="date"
        value={asDate(birthday)?.toISOString().slice(0, 10)}
        on:change={({ target }) => {
          birthday = new Date(asInput(target).valueAsNumber);
        }}
      />
    </FormInput>
    <FormInput label="Numéro de téléphone :" errors={formErrors?.phone?._errors}>
      <input type="tel" bind:value={phone} />
    </FormInput>
  </p>
  <p>
    <FormInput label="Adresse :" errors={formErrors?.address?._errors}>
      <input type="text" bind:value={address} />
    </FormInput>
  </p>
  <svelte:fragment slot="footer">
    <Button type="submit" theme="primary" {loading}>S'inscrire</Button>
  </svelte:fragment>
</FormCard>
