<script lang="ts">
  import { page } from '$app/stores';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import InputDate from '$lib/components/InputDate.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import InputNumber from '$lib/components/InputNumber.svelte';
  import InputSearchObject from '$lib/components/InputSearchObject.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import InputUid from '$lib/components/InputUID.svelte';
  import { fieldErrorsToFormattedError } from '$lib/errors.js';
  import { saveSessionToken } from '$lib/session.js';
  import { toasts } from '$lib/toasts';
  import Fuse from 'fuse.js';
  import type { ZodFormattedError } from 'zod';
  import { Login } from '../../login/mutations';
  import type { PageData } from './$houdini';
  import { CompleteSignup } from './mutations';

  export let data: PageData;
  $: ({ PageSignupContinue } = data);

  let candidate = {
    address: '',
    phone: '',
    birthday: null as Date | null,
    graduationYear: new Date().getFullYear() + 3,
    firstName: '',
    lastName: '',
    majorId: null as string | null,
    cededImageRightsToTVn7: false,
    apprentice: false,
    uid: '',
    suggestedUid: '',
    needsManualValidation: null as boolean | null,
    emailValidated: false,
  };

  $: if ($PageSignupContinue.data?.userCandidate)
    candidate = $PageSignupContinue.data.userCandidate;

  $: schoolGroups = $PageSignupContinue.data?.schoolGroups ?? [];

  $: uid = candidate.uid || candidate.suggestedUid;
  let password = '';
  let passwordConfirmation = '';

  $: token = $page.url.searchParams.get('token')!;
  $: args = {
    ...candidate,
    uid,
    token,
    password,
    passwordConfirmation,
    // address,
    // birthday,
    // firstName,
    // graduationYear,
    // lastName,
    // majorId,
    // phone,
    // cededImageRightsToTVn7,
    // apprentice,
  };

  let result: boolean | undefined;
  let loading = false;
  $: isStudent = Boolean($PageSignupContinue.data?.userCandidate?.majorId);
  let formErrors: ZodFormattedError<typeof args> | undefined;
  const register = async () => {
    if (loading) return;

    try {
      loading = true;
      const result = await CompleteSignup.mutate(args);

      if (!toasts.mutation('completeRegistration', '', "Impossible de s'inscrire", result)) {
        if (result.data?.completeRegistration && 'fieldErrors' in result.data.completeRegistration)
          formErrors = fieldErrorsToFormattedError(result.data.completeRegistration.fieldErrors);
        return;
      }

      if ('uid' in result.data.completeRegistration.data) {
        const login = await Login.mutate({
          emailOrUid: result.data.completeRegistration.data.uid,
          password,
        });
        if (toasts.mutation('login', '', 'Impossible de se connecter', login)) {
          saveSessionToken(document, login.data.login.data);
          location.href = '/welcome/';
        }
      }
    } catch (error: unknown) {
      formErrors = { _errors: [(error as Error).message ?? 'Une erreur est survenue'] };
    } finally {
      loading = false;
    }
  };

  const asmajor = (x: unknown) =>
    x as NonNullable<typeof $PageSignupContinue.data>['schoolGroups'][number]['majors'][number];
</script>

<h1>Finaliser mon inscription</h1>

{#if result === undefined || result}
  <form title="Finaliser mon inscription" on:submit|preventDefault={register}>
    {#if candidate.emailValidated}
      <Alert theme="success" inline>
        <strong>Ton inscription est en attente de validation par ton AE.</strong><br />
        Tu peux toujours corriger des informations en attendant.
      </Alert>
    {:else if isStudent && candidate.needsManualValidation}
      <Alert theme="warning" inline>
        <strong>
          Tu n'a pas renseigné ton adresse e-mail universitaire. Une personne de l'équipe
          d'administration de ton AE devra valider manuellement ton inscription.
        </strong>
        <br />
        Si tu as accès à toi boîte mail universitaire, tu peux
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
        maxlength={255}
        bind:value={candidate.firstName}
      />
      <InputText
        label="Nom de famille"
        errors={formErrors?.lastName?._errors}
        required
        maxlength={255}
        bind:value={candidate.lastName}
      />
    </div>
    <InputUid errors={formErrors?.uid?._errors} bind:value={candidate.uid} label="Ton @"></InputUid>
    <InputCheckbox bind:value={isStudent} label="Je suis étudiant·e à Toulouse INP"></InputCheckbox>
    {#if isStudent}
      <div class="side-by-side">
        <InputField label="Filière">
          <InputSearchObject
            search={(q) =>
              new Fuse(
                schoolGroups.flatMap(({ majors }) => majors),
                {
                  keys: ['name', 'shortName', 'schools.name'],
                  threshold: 0.3,
                },
              )
                .search(q)
                .map(({ item }) => item)}
            bind:value={candidate.majorId}
            object={schoolGroups
              .flatMap(({ majors }) => majors)
              .find((major) => major.id === candidate.majorId)}
            labelKey="shortName"
          >
            <svelte:fragment slot="item" let:item>
              {asmajor(item).shortName} · {asmajor(item)
                .schools.map(({ name }) => name)
                .join(', ')}
            </svelte:fragment>
          </InputSearchObject>
        </InputField>
        <InputNumber
          bind:value={candidate.graduationYear}
          label="Promotion"
          errors={formErrors?.graduationYear?._errors}
        />
      </div>
    {/if}

    <div class="side-by-side">
      <InputText
        label="Mot de passe"
        hint="Au moins 8 caractères, mais 12 c'est mieux"
        errors={formErrors?.password?._errors}
        type="password"
        required
        minlength={8}
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
    <InputCheckbox
      bind:value={candidate.cededImageRightsToTVn7}
      label="Je cède mon droit à l'image à TVn7"
    />
    <p class="typo-details">
      Cela revient à remplir et signer <a target="_blank" href="/cessation-droit-image-tvn7.pdf"
        >ce document</a
      >
    </p>
    <section class="optional-info">
      <h2>Informations Personnelles</h2>
      <p class="typo-details muted">
        Ces infos seront visibles par les autres élèves. Elles sont totalement facultatives.
      </p>
      <InputDate
        label="Date de naissance"
        errors={formErrors?.birthday?._errors}
        bind:value={candidate.birthday}
      />
      <InputText
        label="Numéro de téléphone"
        type="tel"
        errors={formErrors?.phone?._errors}
        maxlength={255}
        bind:value={candidate.phone}
      />
      <InputText
        label="Adresse postale"
        errors={formErrors?.address?._errors}
        maxlength={255}
        bind:value={candidate.address}
      />
    </section>
    <section class="submit">
      <ButtonPrimary {loading} submits>S'inscrire</ButtonPrimary>
    </section>
  </form>
{:else}
  <Alert theme="success">
    <h3>Demande enregistrée&nbsp;!</h3>
    <p>
      Tu recevra un email une fois que ton compte sera validé par l'équipe d'administration de ton
      AE.
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
