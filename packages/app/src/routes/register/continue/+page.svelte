<script lang="ts">
  import { goto, invalidate } from '$app/navigation';

  import { page } from '$app/stores';
  import Alert from '$lib/components/alerts/Alert.svelte';
  import Button from '$lib/components/buttons/Button.svelte';
  import FormCard from '$lib/components/cards/FormCard.svelte';
  import FormInput from '$lib/components/inputs/FormInput.svelte';
  import { fieldErrorsToFormattedError } from '$lib/errors.js';
  import { saveSessionToken, sessionUserQuery } from '$lib/session.js';
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
  let password = '';
  let passwordConfirmation = '';

  // Waiting for https://github.com/graphql-editor/graphql-zeus/issues/262 to be fixed
  graduationYear ??= new Date().getFullYear() + 3;

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
    password,
    passwordConfirmation,
  };

  let result: boolean | undefined;
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

      if (completeRegistration.data) {
        const { login } = await $zeus.mutate({
          login: [
            { email: data.userCandidate.email, password },
            { token: true, expiresAt: true, user: sessionUserQuery() },
          ],
        });
        saveSessionToken(login);
        await invalidate();
        await goto('/welcome/');
      }

      result = completeRegistration.data;
    } catch (error: unknown) {
      formErrors = { _errors: [(error as Error).message ?? 'Une erreur est survenue'] };
    } finally {
      loading = false;
    }
  };
</script>

{#if result === undefined}
  <FormCard large title="Finaliser mon inscription" on:submit={register}>
    {#if data.userCandidate.schoolUid === null}
      <Alert theme="warning" inline>
        Votre compte n'est pas encore lié à une école, votre inscription sera validée manuellement.
        Si vous possédez une adresse universitaire, vous pouvez
        <a href="..">recommencer l'inscription</a> avec celle-ci.
      </Alert>
    {/if}
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
    <p class="grid gap-4 desktop:grid-cols-2">
      <FormInput
        label="Mot de passe :"
        hint="Au moins 8 caractères, mais 12 c'est mieux"
        errors={formErrors?.password?._errors}
      >
        <input type="password" minlength="8" required bind:value={password} />
      </FormInput>
      <FormInput
        label="Confirmer le mot de passe :"
        errors={formErrors?.passwordConfirmation?._errors}
      >
        <input
          type="password"
          required
          bind:value={passwordConfirmation}
          on:change={() => {
            if (passwordConfirmation === password) {
              if (formErrors?.passwordConfirmation?._errors)
                formErrors.passwordConfirmation._errors = [];
            } else {
              formErrors ??= { _errors: [] };
              formErrors.passwordConfirmation ??= { _errors: [] };
              formErrors.passwordConfirmation._errors = ['Les mots de passe ne correspondent pas.'];
            }
          }}
        />
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
{:else if result === false}
  <Alert theme="success">
    <h3>Demande enregistrée&nbsp;!</h3>
    <p>
      Votre inscription sera validée manuellement et vous recevrez un email une fois votre compte
      validé.
    </p>
    <p><a href="/">Retourner à l'accueil.</a></p>
  </Alert>
{/if}
