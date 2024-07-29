<script lang="ts">
  import { page } from '$app/stores';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import { fieldErrorsToFormattedError } from '$lib/errors.js';
  import { zeus } from '$lib/zeus';
  import Fuse from 'fuse.js';
  import type { ZodFormattedError } from 'zod';
  import type { PageData } from './$types';

  export let data: PageData;

  let email = $page.url.searchParams.get('email') ?? '';
  const quickSignupCode = $page.params.quickSignupCode;
  $: args = { email, quickSignupCode };

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
            '__typename': true,
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

  $: schoolMailDomains = data.schools
    .flatMap((s) => [s.studentMailDomain, ...s.aliasMailDomains])
    .filter(Boolean);
  $: nonSchoolMailDomains = [
    'gmail.com',
    'outlook.com',
    'yahoo.com',
    'hotmail.com',
    'live.com',
    'icloud.com',
    'me.com',
  ].filter((d) => !schoolMailDomains.includes(d));

  $: domain = email.split('@').at(1)?.toLowerCase();
  $: emailUsername = email.split('@').at(0)?.toLowerCase();
  $: suggestedSchoolMail = suggestedSchoolMailDomain
    ? `${emailUsername}@${suggestedSchoolMailDomain}`
    : '';
  $: isValidSchoolMail = domain && schoolMailDomains.includes(domain);
  $: suggestedSchoolMailDomain =
    // domain part exists
    domain &&
    // domain is not a known email provider
    !nonSchoolMailDomains.includes(domain) &&
    // domain is not a known school domain
    !schoolMailDomains.includes(domain) &&
    // domain is not too short
    domain.length > Math.min(...schoolMailDomains.map((d) => d.length)) * 0.5
      ? // domain fuzzily matches a known school domain
        new Fuse(schoolMailDomains, {
          includeScore: true,
          threshold: 0.2,
          ignoreLocation: true,
          ignoreFieldNorm: true,
        })
          .search(domain)
          .at(0)?.item ?? false
      : false;
</script>

<h1>Inscription</h1>

{#if result === undefined}
  <form title="S'inscrire" on:submit|preventDefault={register}>
    <Alert theme="danger" closed={(formErrors?._errors ?? []).length === 0} inline>
      <strong>{(formErrors?._errors ?? []).join(' ')} </strong>
    </Alert>

    <InputText
      label="Adresse e-mail"
      hintStyle={suggestedSchoolMailDomain
        ? 'warning'
        : isValidSchoolMail && !quickSignupCode
          ? 'success'
          : 'muted'}
      hint={suggestedSchoolMailDomain
        ? `Cette adresse mail ressemble à une e-mail universitaire avec @${suggestedSchoolMailDomain}`
        : // with a quicksignup code, everything is automatically validated,
          // we don't want to confuse users who'll look at their friend's screen
          // and see a green checkmark while they don't have one
          isValidSchoolMail && !quickSignupCode
          ? 'Ton inscription sera automatiquement validée'
          : 'Si vous en avez une, et que vous y avez accès, utilisez votre adresse e-mail universitaire'}
      errors={formErrors?.email?._errors}
      type="email"
      bind:value={email}
      maxlength={255}
      required
    >
      <span class="apply-suggestion" slot="hint">
        {#if suggestedSchoolMailDomain}
          <ButtonInk
            insideProse
            on:click={() => {
              email = suggestedSchoolMail;
            }}
            >Utiliser
          </ButtonInk>
        {/if}
      </span>
    </InputText>

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
