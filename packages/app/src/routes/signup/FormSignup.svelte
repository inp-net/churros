<script lang="ts" context="module">
  export type Args = {
    major: string;
    graduationYear: number;
    apprentice: boolean;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    passwordConfirmation: string;
  };
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import { env } from '$env/dynamic/public';
  import { fragment, graphql, type FormSignup, type FormSignupQuickSignup } from '$houdini';
  import InputUID from '$lib/components/InputUID.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputMajor from '$lib/components/InputMajor.svelte';
  import InputPassword from '$lib/components/InputPassword.svelte';
  import InputRadios from '$lib/components/InputRadios.svelte';
  import InputStudentEmail from '$lib/components/InputStudentEmail.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import LoadingChurros from '$lib/components/LoadingChurros.svelte';
  import LogoChurros from '$lib/components/LogoChurros.svelte';
  import { fromYearTier } from '$lib/dates';
  import { mutate } from '$lib/mutations';
  import { route } from '$lib/ROUTES';
  import { toasts } from '$lib/toasts';
  import IconMailSent from '~icons/msl/mark-email-unread-outline';

  export let quickSignup: FormSignupQuickSignup | null;
  $: dataQuickSignup = fragment(
    quickSignup,
    graphql(`
      fragment FormSignupQuickSignup on QuickSignup {
        expired
        school {
          ...InputMajorInitialSchool
        }
      }
    `),
  );

  export let data: FormSignup;
  $: Data = fragment(
    data,
    graphql(`
      fragment FormSignup on Query {
        ...InputMajor
        majors {
          uid
          ...InputStudentEmail
        }
      }
    `),
  );

  const SuggestedUid = graphql(`
    query SuggestedUserUid($firstName: String!, $lastName: String!) {
      suggestedUid(firstName: $firstName, lastName: $lastName)
    }
  `);

  async function suggestUid() {
    if (!args.username && args.firstName && args.lastName) {
      const { data } = await SuggestedUid.fetch({
        variables: {
          firstName: args.firstName,
          lastName: args.lastName,
        },
      });
      args.username ||= data?.suggestedUid ?? '';
    }
  }

  const Signup = graphql(`
    mutation SignupViaQRCode(
      $qrcode: String
      $major: UID!
      $graduationYear: Int!
      $email: Email!
      $firstName: String!
      $lastName: String!
      $username: UID!
      $password: String!
      $passwordConfirmation: String!
      $mailVerificationCallbackURL: URL!
    ) {
      startSignup(
        email: $email
        firstName: $firstName
        graduationYear: $graduationYear
        lastName: $lastName
        mailVerificationCallbackURL: $mailVerificationCallbackURL
        major: $major
        uid: $username
        quickSignupCode: $qrcode
        password: $password
        passwordConfirmation: $passwordConfirmation
      ) {
        ... on MutationStartSignupSuccess {
          data {
            needsManualValidation
          }
        }
        ...MutationErrors
      }
    }
  `);

  export let args: Args = {
    apprentice: false,
    email: '',
    firstName: '',
    graduationYear: fromYearTier(1),
    lastName: '',
    major: '',
    password: '',
    passwordConfirmation: '',
    username: '',
  };

  $: selectedMajor = args.major ? $Data.majors.find((m) => m.uid === args.major) : null;

  let loading = false;
  let success = false;
</script>

<header>
  <div class="logo">
    <LogoChurros wordmark />
  </div>
  <p>La plateforme d'organisation de la vie étudiante</p>
</header>
{#if success}
  <div class="sent">
    <div class="check">
      <IconMailSent />
    </div>
    <h2>Mail envoyé.</h2>
    <p>
      Tu as dû recevoir un mail de la part de<br />
      <strong class="primary">{env.PUBLIC_SUPPORT_EMAIL}</strong>.<br />
      Vérifie dans tes spams au cas où
    </p>
    <section class="actions">
      <ButtonSecondary
        on:click={() => {
          success = false;
        }}>Retour</ButtonSecondary
      >
    </section>
  </div>
{:else if loading}
  <div class="loading">
    <div class="spinner">
      <LoadingChurros />
    </div>
    <h2>Inscription en cours...</h2>
    <p>Encore quelques instants...</p>
  </div>
{:else}
  <form
    on:submit|preventDefault={async () => {
      loading = true;
      if (
        toasts.mutation(
          await mutate(Signup, {
            qrcode: $page.params.qrcode,
            mailVerificationCallbackURL: new URL(
              route('/signup/finish/[token]', '[token]'),
              $page.url,
            ),
            ...args,
          }),
          'startSignup',
          '',
          "Impossible de t'inscrire",
          {
            lifetime: Number.POSITIVE_INFINITY,
          },
        )
      )
        success = true;

      loading = false;
    }}
  >
    <div class="curriculum">
      <div class="major">
        <InputMajor
          clearable={!$dataQuickSignup}
          clearLabel="Externe"
          options={$Data}
          bind:major={args.major}
          initialSchool={$dataQuickSignup?.school ?? null}
        />
      </div>
      <div class="promotion">
        <InputRadios
          bind:value={args.graduationYear}
          options={[
            [fromYearTier(1), '1re année'],
            [fromYearTier(2), '2e année'],
            [fromYearTier(3), '3e année'],
          ]}
        />
      </div>
      <div class="apprenticeship">
        <InputRadios
          value={args.apprentice ? 1 : 0}
          on:change={({ detail }) => {
            args.apprentice = Boolean(detail);
          }}
          options={[
            [0, 'FISE (Étudiant.e.s)'],
            [1, 'FISA (Apprenti.e.s)'],
          ]}
        />
      </div>
    </div>
    <InputStudentEmail
      major={selectedMajor ?? null}
      usingQuickSignupCode={$dataQuickSignup !== null}
      label="Ton email"
      bind:value={args.email}
    />
    <div class="side-by-side">
      <InputText on:blur={suggestUid} bind:value={args.firstName} required label="Prénom" />
      <InputText on:blur={suggestUid} bind:value={args.lastName} required label="Nom de famille" />
    </div>
    <InputUID label="Un ptit pseudo" bind:value={args.username} />
    <InputPassword label="Un mot de passe" bind:value={args.password} />
    <InputPassword
      hint=""
      label="Le même mot de passe"
      bind:value={args.passwordConfirmation}
      errors={args.password &&
      args.passwordConfirmation &&
      args.password !== args.passwordConfirmation
        ? ['Les mot de passes ne correspondent pas']
        : []}
    />
    <section class="submit">
      <ButtonPrimary submits>M'inscrire</ButtonPrimary>
    </section>
  </form>
{/if}

<style>
  .sent {
    text-align: center;
  }

  .loading {
    text-align: center;
  }

  .spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 3rem;
    font-size: 5rem;
  }

  .side-by-side {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem 0.5rem;
    align-items: center;
  }

  .submit {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 3rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .promotion,
  .apprenticeship {
    display: flex;
    flex-wrap: wrap;
    gap: 1em 0.5rem;
    align-items: center;
  }

  .major {
    margin-bottom: 2rem;
  }

  header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 0;
    margin-bottom: 3rem;
  }

  header .logo {
    width: 100%;
    max-width: 300px;
    max-height: 25vh;
  }

  .check {
    font-size: 5rem;
    color: var(--primary);
  }
</style>
