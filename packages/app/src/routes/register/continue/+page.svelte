<script lang="ts">
  import { page } from '$app/stores';
  import Alert from '$lib/components/alerts/Alert.svelte';
  import Button from '$lib/components/buttons/Button.svelte';
  import FormCard from '$lib/components/cards/FormCard.svelte';
  import InputGroup from '$lib/components/groups/InputGroup.svelte';
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

<FormCard large on:submit={register}>
  <svelte:fragment slot="header">Finaliser mon inscription</svelte:fragment>
  <Alert theme="danger" closed={(formErrors?._errors ?? []).length === 0} inline>
    {#each formErrors?._errors ?? [] as error}
      <strong>{error}. </strong>
    {/each}
  </Alert>
  <div class="grid gap-4 grid-cols-2">
    <Alert theme="danger" closed={(formErrors?.firstName?._errors ?? []).length === 0} inline>
      {#each formErrors?.firstName?._errors ?? [] as error}
        <strong>{error}. </strong>
      {/each}
    </Alert>
    <Alert theme="danger" closed={(formErrors?.lastName?._errors ?? []).length === 0} inline>
      {#each formErrors?.lastName?._errors ?? [] as error}
        <strong>{error}. </strong>
      {/each}
    </Alert>
  </div>
  <p class="grid gap-4 grid-cols-2">
    <label>
      Prénom&nbsp;:
      <input type="text" bind:value={firstName} required />
    </label>
    <label>
      Nom de famille&nbsp;:
      <input type="text" bind:value={lastName} required />
    </label>
  </p>
  <Alert theme="danger" closed={(formErrors?.majorId?._errors ?? []).length === 0} inline>
    {#each formErrors?.majorId?._errors ?? [] as error}
      <strong>{error}. </strong>
    {/each}
  </Alert>
  <Alert theme="danger" closed={(formErrors?.graduationYear?._errors ?? []).length === 0} inline>
    {#each formErrors?.graduationYear?._errors ?? [] as error}
      <strong>{error}. </strong>
    {/each}
  </Alert>
  <p>
    Filière et promotion&nbsp;:
    <InputGroup>
      <select bind:value={majorId} required>
        {#each data.schoolGroups as { majors, names }}
          <optgroup label={names.join(', ')}>
            {#each majors as { id, name }}
              <option value={id}>{name}</option>
            {/each}
          </optgroup>
        {/each}
      </select>
      <input type="number" bind:value={graduationYear} size="4" required />
    </InputGroup><br />
    Si c'est votre première année, vous êtes de la promotion
    {new Date().getFullYear() + 3}.
  </p>
  <hr />
  <p>Les champs suivant sont facultatifs.</p>
  <div class="grid gap-4 grid-cols-2">
    <Alert theme="danger" closed={(formErrors?.birthday?._errors ?? []).length === 0} inline>
      {#each formErrors?.birthday?._errors ?? [] as error}
        <strong>{error}. </strong>
      {/each}
    </Alert>
    <Alert theme="danger" closed={(formErrors?.phone?._errors ?? []).length === 0} inline>
      {#each formErrors?.phone?._errors ?? [] as error}
        <strong>{error}. </strong>
      {/each}
    </Alert>
  </div>
  <p class="grid gap-4 grid-cols-2">
    <label>
      Date de naissance&nbsp;:
      <input
        type="date"
        value={asDate(birthday)?.toISOString().slice(0, 10)}
        on:change={({ target }) => {
          birthday = new Date(asInput(target).valueAsNumber);
        }}
      />
    </label>
    <label>
      Numéro de téléphone&nbsp;:
      <input type="tel" bind:value={phone} />
    </label>
  </p>
  <Alert theme="danger" closed={(formErrors?.address?._errors ?? []).length === 0} inline>
    {#each formErrors?.address?._errors ?? [] as error}
      <strong>{error}. </strong>
    {/each}
  </Alert>
  <p>
    <label>
      Adresse&nbsp;:
      <input type="text" bind:value={address} />
    </label>
  </p>
  <svelte:fragment slot="footer">
    <Button type="submit" theme="primary" {loading}>S'inscrire</Button>
  </svelte:fragment>
</FormCard>

<style lang="scss">
  label {
    display: inline-block;
    width: 100%;

    input {
      display: block;
      width: 100%;
    }
  }
</style>
