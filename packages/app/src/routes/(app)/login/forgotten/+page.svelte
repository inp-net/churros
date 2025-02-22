<script>
  import { env } from '$env/dynamic/public';
  import { graphql } from '$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import { mutationErrorMessages, mutationSucceeded } from '$lib/errors';
  import { oauthEnabled, oauthPasswordResetURL } from '$lib/oauth';
  import IconOauthSignin from '~icons/msl/key-outline';

  let email = '';
  let serverError = '';
  let loading = false;
  let sent = false;

  async function submit() {
    loading = true;
    try {
      const CreatePasswordReset = graphql(`
        mutation CreatePasswordReset($email: String!) {
          createPasswordReset(email: $email) {
            __typename
            ...MutationErrors
            ... on InvalidAuthProviderError {
              message
            }
            ... on MutationCreatePasswordResetSuccess {
              data
            }
          }
        }
      `);

      const result = await CreatePasswordReset.mutate({ email });

      if (mutationSucceeded('createPasswordReset', result)) {
        serverError = '';
        sent = true;
      } else {
        serverError = mutationErrorMessages('createPasswordReset', result).join('\n\n');
        sent = false;
      }
    } finally {
      loading = false;
    }
  }

  const oauthPasswordResetHref = oauthPasswordResetURL();
</script>

<div class="content">
  <h1>Mote de passe oublié?</h1>

  {#if oauthPasswordResetHref}
    <section class="oauth">
      <ButtonSecondary href={oauthPasswordResetHref} noClientSideNavigation>
        <div class="oauth-logo" slot="icon">
          {#if env.PUBLIC_OAUTH_LOGO_URL}
            <img src={env.PUBLIC_OAUTH_LOGO_URL} alt={env.PUBLIC_OAUTH_NAME} />
          {:else}
            <IconOauthSignin />
          {/if}
        </div>
        {#if env.PUBLIC_OAUTH_NAME}
          Réinitialiser via {env.PUBLIC_OAUTH_NAME}
        {:else}
          Réinitialiser via un fournisseur tiers
        {/if}
      </ButtonSecondary>
    </section>
    <div class="or-separator">ou</div>
  {/if}

  {#if serverError}
    <div class="status">
      <Alert theme="danger">{serverError}</Alert>
    </div>
  {/if}

  {#if sent}
    <div class="status">
      <Alert theme="success">Mail envoyé à {email}</Alert>
    </div>

    <p class="explainer">Check tes spams au cas où.</p>
  {:else}
    <form on:submit|preventDefault={submit}>
      <InputText label="Votre adresse e-mail" required type="email" bind:value={email} />

      <section class="submit">
        <ButtonPrimary submits {loading}>Envoyer</ButtonPrimary>
      </section>
    </form>

    <p class="explainer">
      Nous allons vous envoyer un mail contenant un lien. Celui-ci vous amènera sur une page sur
      laquelle vous pourrez choisir un nouveau mot de passe.
    </p>
  {/if}
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 600px;
    margin: 0 auto;
  }

  h1 {
    text-align: center;
  }

  form {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    margin: 0 auto;
  }

  .submit,
  .oauth {
    display: flex;
    justify-content: center;
  }

  .status {
    margin-top: 2rem;
  }

  .or-separator {
    display: flex;
    gap: 0.5em;
    align-items: center;
    text-align: center;
  }

  .or-separator::before,
  .or-separator::after {
    display: inline-block;
    width: 50%;
    height: 1px;
    content: '';
    border-top: var(--border-block) solid var(--shy);
  }

  .explainer {
    font-size: 0.9em;
    color: var(--muted);
  }
</style>
