<script lang="ts">
  import { page } from '$app/stores';
  import Alert from '$lib/components/Alert.svelte';

  import { fieldErrorsToFormattedError } from '$lib/errors.js';
  import { saveSessionToken, sessionUserQuery } from '$lib/session.js';
  import { zeus } from '$lib/zeus.js';
  import type { ZodFormattedError } from 'zod';
  import type { PageData } from './$types';
  import InputField from '$lib/components/InputField.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import InputSearchObject from '$lib/components/InputSearchObject.svelte';
  import Fuse from 'fuse.js';
  import InputNumber from '$lib/components/InputNumber.svelte';
  import InputDate from '$lib/components/InputDate.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';

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

      result = completeRegistration.data;

      if (result) {
        const { login } = await $zeus.mutate({
          login: [
            { email: data.userCandidate.email, password },
            {
              __typename: true,
              '...on Error': { message: true },
              '...on MutationLoginSuccess': {
                data: { token: true, expiresAt: true, user: sessionUserQuery() },
              },
            },
          ],
        });

        if (login.__typename === 'MutationLoginSuccess') {
          saveSessionToken(document, login.data);
          // Hard refresh (invalidating is not possible because UserCandidate
          // is deleted after registration, throwing a ZeusError)
          location.href = '/welcome/';
        }
      }
    } catch (error: unknown) {
      formErrors = { _errors: [(error as Error).message ?? 'Une erreur est survenue'] };
    } finally {
      loading = false;
    }
  };

  const asmajor = (x: unknown) => x as (typeof data)['schoolGroups'][number]['majors'][number];
</script>

<h1>Finaliser mon inscription</h1>

{#if result === undefined || result}
  <form title="Finaliser mon inscription" on:submit|preventDefault={register}>
    {#if data.userCandidate.emailValidated}
      <Alert theme="success" inline>
        <strong>Votre inscription est en attente de validation manuelle.</strong><br />
        Cependant, vous pouvez toujours compléter ou corriger les informations ci-dessous.
      </Alert>
    {:else if data.userCandidate.schoolUid === null}
      <Alert theme="warning" inline>
        <strong>
          Votre compte n'est pas encore lié à une école, votre inscription sera validée
          manuellement.
        </strong>
        <br />
        Si vous possédez une adresse universitaire, vous pouvez
        <a href="..">recommencer l'inscription</a> avec celle-ci.
      </Alert>
    {/if}
    <Alert theme="danger" closed={(formErrors?._errors ?? []).length === 0} inline>
      <strong>{(formErrors?._errors ?? []).join(' ')}</strong>
    </Alert>
    <div class="side-by-side">
      <InputText
        label="Prénom"
        errors={formErrors?.firstName?._errors}
        required
        bind:value={firstName}
      />
      <InputText
        label="Nom de famille"
        errors={formErrors?.lastName?._errors}
        required
        bind:value={lastName}
      />
    </div>
    <div class="side-by-side">
      <InputField label="Filière">
        <InputSearchObject
          search={(q) =>
            new Fuse(
              data.schoolGroups.flatMap(({ majors }) => majors),
              {
                keys: ['name'],
                threshold: 0.3,
              }
            )
              .search(q)
              .map(({ item }) => item)}
          bind:value={majorId}
          object={data.schoolGroups
            .flatMap(({ majors }) => majors)
            .find((major) => major.id === majorId)}
          labelKey="name"
        >
          <svelte:fragment slot="item" let:item>
            {asmajor(item).name} · {asmajor(item)
              .schools.map(({ name }) => name)
              .join(', ')}
          </svelte:fragment>
        </InputSearchObject>
      </InputField>
      <InputNumber
        bind:value={graduationYear}
        label="Promotion"
        errors={formErrors?.graduationYear?._errors}
      />
    </div>
    <InputDate
      label="Date de naissance"
      errors={formErrors?.birthday?._errors}
      bind:value={birthday}
    />
    <InputText
      label="Numéro de téléphone"
      type="tel"
      errors={formErrors?.phone?._errors}
      bind:value={phone}
    />
    <InputText label="Adresse" errors={formErrors?.address?._errors} bind:value={address} />
    <div class="side-by-side">
      <InputText
        label="Mot de passe"
        hint="Au moins 8 caractères, mais 12 c'est mieux"
        errors={formErrors?.password?._errors}
        type="password"
        required
        bind:value={password}
      />
      <InputText
        label="Confirmer le mot de passe"
        errors={formErrors?.passwordConfirmation?._errors}
        type="password"
        required
        bind:value={passwordConfirmation}
        on:input={() => {
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
    </div>
    <section class="submit">
      <ButtonPrimary submits>S'inscrire</ButtonPrimary>
    </section>
  </form>
{:else}
  <Alert theme="success">
    <h3>Demande enregistrée&nbsp;!</h3>
    <p>
      Votre inscription sera validée manuellement et vous recevrez un email une fois votre compte
      validé.
    </p>
    <p><a href="/">Retourner à l'accueil.</a></p>
  </Alert>
{/if}

<style>
  h1 {
    margin-bottom: 2rem;
    text-align: center;
  }

  .side-by-side {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: end;
  }

  form {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    max-width: 700px;
    margin: 0 auto;
  }

  form .submit {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }
</style>
