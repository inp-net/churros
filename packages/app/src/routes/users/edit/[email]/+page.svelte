<script lang="ts">
  import { goto } from '$app/navigation';
  import Alert from '$lib/components/Alert.svelte';

  import { fieldErrorsToFormattedError } from '$lib/errors.js';
  import { zeus } from '$lib/zeus.js';
  import type { ZodFormattedError } from 'zod';
  import type { PageData } from './$types';
  import InputField from '$lib/components/InputField.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import InputSearchObject from '$lib/components/InputSearchObject.svelte';
  import Fuse from 'fuse.js';
  import InputNumber from '$lib/components/InputNumber.svelte';
  import InputDate from '$lib/components/InputDate.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ButtonBack from '$lib/components/ButtonBack.svelte';

  export let data: PageData;

  let {
    address,
    phone,
    birthday,
    firstName,
    graduationYear = new Date().getFullYear() + 3,
    lastName,
    majorId,
  } = data.userCandidateByEmail;

  // Waiting for https://github.com/graphql-editor/graphql-zeus/issues/262 to be fixed
  graduationYear ??= new Date().getFullYear() + 3;

  $: args = {
    email: data.userCandidateByEmail.email,
    address,
    birthday,
    firstName,
    graduationYear,
    lastName,
    majorId: majorId!,
    phone,
  };

  let loading = false;
  let loadingSave = false;
  let loadingRegister = false;
  let loadingRefuse = false;
  let formErrors: ZodFormattedError<typeof args> | undefined;
  const onSubmit = async ({ submitter }: SubmitEvent) => {
    if (loading) return;
    if (!submitter) return;

    const update = !submitter.dataset.refuse;

    try {
      loading = true;

      if (update) {
        const register = Boolean(submitter.dataset.register);
        loadingRegister = register;
        loadingSave = !register;
        await updateUserCandidate(register);
        if (register) await goto('../..');
      } else {
        loadingRefuse = true;
        await $zeus.mutate({
          refuseRegistration: [{ email: data.userCandidateByEmail.email }, true],
        });
      }
    } finally {
      loading = false;
      loadingSave = false;
      loadingRegister = false;
      loadingRefuse = false;
    }
  };

  const updateUserCandidate = async (register: boolean) => {
    try {
      const { updateUserCandidate } = await $zeus.mutate({
        updateUserCandidate: [
          { register, ...args },
          {
            __typename: true,
            '...on MutationUpdateUserCandidateSuccess': { data: true },
            '...on Error': { message: true },
            '...on ZodError': { message: true, fieldErrors: { path: true, message: true } },
          },
        ],
      });

      if (updateUserCandidate.__typename === 'ZodError') {
        formErrors = fieldErrorsToFormattedError(updateUserCandidate.fieldErrors);
        return;
      }

      if (updateUserCandidate.__typename === 'Error') {
        formErrors = { _errors: [updateUserCandidate.message] };
        return;
      }
    } catch (error: unknown) {
      formErrors = { _errors: [(error as Error).message ?? 'Une erreur est survenue'] };
    }
  };

  const asmajor = (x: unknown) => x as typeof data.schoolGroups[number]['majors'][number];
</script>

<h1>
  <ButtonBack go="../.." /> Demande d'inscription de
  <strong>{data.userCandidateByEmail.email}</strong>
</h1>

<form title="Modifier une inscription" on:submit|preventDefault={onSubmit}>
  <Alert theme="danger" closed={(formErrors?._errors ?? []).length === 0} inline>
    <strong>{(formErrors?._errors ?? []).join(' ')}</strong>
  </Alert>
  <div class="side-by-side">
    <InputText label="Prénom" errors={formErrors?.firstName?._errors} bind:value={firstName} />
    <InputText
      label="Nom de famille"
      errors={formErrors?.lastName?._errors}
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

  <div class="actions">
    <ButtonSecondary submits data-save loading={loadingSave} disabled={loading}
      >Sauvegarder</ButtonSecondary
    >
    <ButtonSecondary submits data-register success loading={loadingSave} disabled={loading}
      >Sauvegarder et inscrire</ButtonSecondary
    >
    <ButtonSecondary submits danger disabled={loading} loading={loadingRefuse} data-refuse>
      Refuser
    </ButtonSecondary>
  </div>
</form>

<style>
  h1 {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  form {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
  }
</style>
