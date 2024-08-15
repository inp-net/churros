<script lang="ts">
  import { graphql } from '$houdini';
  import { InputUID, MaybeError } from '$lib/components';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputMajor from '$lib/components/InputMajor.svelte';
  import InputPassword from '$lib/components/InputPassword.svelte';
  import InputRadios from '$lib/components/InputRadios.svelte';
  import InputStudentEmail from '$lib/components/InputStudentEmail.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import { fromYearTier } from '$lib/dates';
  import type { PageData } from './$houdini';

  export let data: PageData;

  $: ({ PageQuickSignup } = data);

  let major: string;
  let graduationYear: number;
  let apprentice: boolean;
  let email: string;
  let firstName: string;
  let lastName: string;
  let uid: string;
  let password: string;
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons

  const _Signup = graphql(`
    mutation SignupViaQRCode(
      $qrcode: LocalID!
      $major: UID!
      $graduationYear: Int!
      $email: Email!
      $firstName: String!
      $lastName: String!
      $username: UID!
      $password: String!
    ) {
      startSignup(email: $email)
    }
  `);
</script>

<MaybeError result={$PageQuickSignup} let:data>
  {@const { quickSignup } = data}
  <form class="contents" on:submit|preventDefault={async () => {}}>
    <InputMajor options={data} bind:major initialSchool={quickSignup.school} />
    <InputRadios
      bind:value={graduationYear}
      options={[
        [fromYearTier(1), '1re année'],
        [fromYearTier(2), '2e année'],
        [fromYearTier(3), '3e année'],
      ]}
    />
    <InputRadios
      value={apprentice ? 1 : 0}
      on:change={({ detail }) => {
        apprentice = Boolean(detail);
      }}
      options={[
        [0, 'FISE (Étudiant.e.s)'],
        [1, 'FISA (Apprenti.e.s)'],
      ]}
    />
    <InputStudentEmail
      validationData={data}
      usingQuickSignupCode
      label="Ton email"
      bind:value={email}
    />
    <div class="side-by-side">
      <InputText bind:value={firstName} required label="Prénom" />
      <InputText bind:value={lastName} required label="Nom de famille" />
    </div>
    <InputUID label="Un ptit pseudo" bind:value={uid} />
    <InputPassword label="Un mot de passe" bind:value={password} />
    <section class="submit">
      <ButtonPrimary submits>M'inscrire</ButtonPrimary>
    </section>
  </form></MaybeError
>

<style>
  .contents {
    padding: 0 1rem;
  }
</style>
