<script lang="ts">
  import { goto } from '$app/navigation';
  import LogoChurros from '$lib/components/LogoChurros.svelte';
  import { page } from '$app/stores';
  import { env } from '$env/dynamic/public';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import { mutationErrorMessages, mutationSucceeded } from '$lib/errors';
  import { oauthEnabled, oauthInitiateLogin } from '$lib/oauth';
  import { route } from '$lib/ROUTES';
  import IconOauthSignin from '~icons/msl/key-outline';
  import { saveSessionToken } from '$lib/session';
  import IconEye from '~icons/msl/visibility-outline';
  import IconEyeOff from '~icons/msl/visibility-off-outline';
  import { Login } from './mutations';

  let showingPassword = false;

  let password: string;
  let email: string;
  let serverError = '';

  $: migratingPassword = $page.url.searchParams.has('migrate');
</script>

<form
  title="Se connecter"
  on:submit|preventDefault={async () => {
    const result = await Login.mutate({ emailOrUid: email, password });

    if (mutationSucceeded('login', result)) {
      await saveSessionToken(null, result.data.login.data);
      await goto(
        `${route('/login/done')}?${new URLSearchParams({
          from: $page.url.searchParams.get('from') ?? '/',
        })}`,
      );
    } else {
      serverError = mutationErrorMessages('login', result).join('\n');
    }
  }}
>
  {#if $page.url.searchParams.get('why') === 'unauthorized'}
    <Alert theme="warning">Cette page nécessite une connexion.</Alert>
  {/if}

  <LogoChurros wordmark />

  {#if oauthEnabled()}
    <section class="oauth">
      <ButtonSecondary
        on:click={async () => {
          await oauthInitiateLogin({ url: $page.url });
        }}
      >
        <div class="oauth-logo" slot="icon">
          {#if env.PUBLIC_OAUTH_LOGO_URL}
            <img src={env.PUBLIC_OAUTH_LOGO_URL} alt={env.PUBLIC_OAUTH_NAME} />
          {:else}
            <IconOauthSignin />
          {/if}
        </div>
        {#if env.PUBLIC_OAUTH_NAME}
          Connexion via {env.PUBLIC_OAUTH_NAME}
        {:else}
          Connexion rapide
        {/if}
      </ButtonSecondary>
    </section>
    <div class="or-separator">ou</div>
  {/if}

  <Alert theme="danger" closed={!serverError}>
    {serverError}
  </Alert>
  <InputText
    bind:value={email}
    name="email"
    required
    label="Adresse e-mail ou pseudo"
    autofocus={!oauthEnabled()}
  />
  <InputText
    bind:value={password}
    required
    name="password"
    type={showingPassword ? 'text' : 'password'}
    label="Mot de passe"
    actionIcon={showingPassword ? IconEyeOff : IconEye}
    on:action={() => {
      showingPassword = !showingPassword;
    }}
  />
  <section class="submit">
    <ButtonPrimary submits>
      {#if migratingPassword}Migrer{:else}Se connecter{/if}
    </ButtonPrimary>
  </section>

  <hr />
  <section class="actions">
    <ButtonSecondary href={route('/login/forgotten')}>Mot de passe oublié</ButtonSecondary>
    <ButtonSecondary href={route('/signup')}>S'inscrire</ButtonSecondary>
  </section>
</form>

<style lang="scss">
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 400px;
    padding: 0 1rem;
    margin: auto;
  }

  .submit,
  .oauth {
    display: flex;
    justify-content: center;
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

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .oauth-logo {
    display: flex;
    font-size: 1.2em;
  }
</style>
