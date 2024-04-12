<script lang="ts">
  import { graphql } from '$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import InputDate from '$lib/components/InputDate.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import InputNumber from '$lib/components/InputNumber.svelte';
  import InputSearchObject from '$lib/components/InputSearchObject.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import Fuse from 'fuse.js';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$houdini';
  import { toasts } from '$lib/toasts';
  import { saveSessionToken } from '$lib/session';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  export let data: PageData;

  $: ({ RegisterContinuePage } = data);
  $: candidate = $RegisterContinuePage.data?.userCandidate;
  $: schoolGroups = $RegisterContinuePage.data?.schoolGroups ?? [];
  $: token = $page.url.searchParams.get('token');

  let done = false;
  let loading = false;
  $: isStudent = Boolean(candidate?.schoolUid);

  const login = graphql(`
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        ... on MutationLoginSuccess {
          data {
            token
            expiresAt
          }
        }
        ... on Error {
          message
        }
      }
    }
  `);

  const { form, enhance, capture, restore } = superForm(data.registerForm, {
    onSubmit: ({ cancel }) => {
      if (loading) cancel();
      loading = true;
    },
    onResult: async ({ result }) => {
      loading = false;
      if (!candidate?.email || result.status !== 200) {
        toasts.error("Une erreur est survenue lors de l'inscription.");
        return;
      }

      done = true;

      const { data, errors } = await login.mutate({
        email: candidate.email,
        password: $form.password,
      });

      if (errors || !data?.login || !('data' in data.login)) {
        toasts.error('Une erreur est survenue lors de la connexion automatique.');
        await goto('/register');
        return;
      }

      saveSessionToken(document, data.login.data);
      await goto('/welcome');
    },
  });

  export const snapshot = { capture, restore };
</script>

<h1>Finaliser mon inscription</h1>

{#if !done}
  <form title="Finaliser mon inscription" method="POST" use:enhance action="?/register">
    {#if candidate?.emailValidated}
      <Alert theme="success" inline>
        <strong>Votre inscription est en attente de validation manuelle.</strong><br />
        Cependant, vous pouvez toujours compléter ou corriger les informations ci-dessous.
      </Alert>
    {:else if isStudent && candidate?.schoolUid === null}
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
    <input type="hidden" name="token" value={token} />
    <div class="side-by-side">
      <InputText
        name="firstName"
        label="Prénom"
        required
        maxlength={255}
        bind:value={$form.firstName}
      />
      <InputText
        name="lastName"
        label="Nom de famille"
        required
        maxlength={255}
        bind:value={$form.lastName}
      />
    </div>
    <InputCheckbox
      value={isStudent}
      on:change={({ target }) => {
        if (!(target instanceof HTMLInputElement)) return;
        isStudent = target.checked;
      }}
      label="Je suis étudiant·e à Toulouse INP"
    ></InputCheckbox>
    {#if isStudent}
      <div class="side-by-side">
        <InputField label="Filière">
          <InputSearchObject
            name="majorId"
            search={(q) =>
              new Fuse(
                schoolGroups.flatMap(({ majors }) => majors),
                {
                  keys: ['name', 'shortName'],
                  threshold: 0.3,
                },
              )
                .search(q)
                .map(({ item }) => item)}
            bind:value={$form.majorId}
            object={schoolGroups
              .flatMap(({ majors }) => majors)
              .find((major) => major.id === $form.majorId)}
            labelKey="shortName"
          >
            <svelte:fragment slot="item" let:item>
              {item.shortName} · {item.schools.map(({ name }) => name).join(', ')}
            </svelte:fragment>
          </InputSearchObject>
        </InputField>
        <InputNumber name="graduationYear" bind:value={$form.graduationYear} label="Promotion" />
      </div>
    {/if}

    <div class="side-by-side">
      <InputText
        label="Mot de passe"
        hint="Au moins 8 caractères, mais 12 c'est mieux"
        type="password"
        required
        minlength={8}
        name="password"
        bind:value={$form.password}
      />
      <InputText
        label="Confirmer le mot de passe"
        type="password"
        required
        name="passwordConfirmation"
        bind:value={$form.passwordConfirmation}
      />
    </div>
    <InputCheckbox
      bind:value={$form.cededImageRightsToTVn7}
      name="imageRightsCededToTVn7"
      label="Je cède mon droit à l'image à TVn7"
    />
    <p class="typo-details">
      Cela revient à remplir et signer <a href="/cessation-droit-image-tvn7.pdf">ce document</a>
    </p>
    <section class="optional-info">
      <h2>Informations Personnelles</h2>
      <p class="typo-details muted">
        Ces infos seront visibles par les autres élèves. Elles sont totalement facultatives.
      </p>
      <InputDate name="birthday" label="Date de naissance" bind:value={$form.birthday} />
      <InputText
        name="phone"
        label="Numéro de téléphone"
        type="tel"
        maxlength={255}
        bind:value={$form.phone}
      />
      <InputText
        name="address"
        label="Adresse postale"
        maxlength={255}
        bind:value={$form.address}
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
