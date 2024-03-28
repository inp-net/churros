<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import IconPasskey from '~icons/mdi/fingerprint';
  import { me, saveSessionToken, sessionUserQuery } from '$lib/session';
  import { zeus } from '$lib/zeus';
  import { startAuthentication } from '@simplewebauthn/browser';
  import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';
  import { onMount } from 'svelte';
  import IconEye from '~icons/mdi/eye';
  import IconEyeOff from '~icons/mdi/eye-off';
  import { toasts } from '$lib/toasts';

  let email = '';
  let password = '';
  let showingPassword = false;

  /** Redirects the user if a `to` parameter exists, or to "/" otherwise. */
  const redirect = async () => {
    let url = new URL($page.url.searchParams.get('to') ?? '/', $page.url);
    if (url.origin !== $page.url.origin || url.pathname.startsWith('/login'))
      url = new URL('/', $page.url);
    const searchParams = new URLSearchParams(
      [...$page.url.searchParams.entries()].filter(([k]) => k !== 'to'),
    );
    return goto(new URL(`${url.toString()}?${searchParams.toString()}`), { invalidateAll: true });
  };

  let loading = false;
  let passkeyLoading = false;
  let errorMessages: string[] | undefined;
  const login = async () => {
    if (loading) return;

    try {
      loading = true;
      errorMessages = undefined;
      const { login } = await $zeus.mutate({
        login: [
          { email, password },
          {
            '__typename': true,
            '...on Error': { message: true },
            '...on MutationLoginSuccess': {
              data: { token: true, expiresAt: true, user: sessionUserQuery() },
            },
          },
        ],
      });

      if (login.__typename === 'Error') {
        errorMessages = [login.message];
        return;
      }

      saveSessionToken(document, login.data);
      await redirect();
    } finally {
      loading = false;
    }
  };

  async function usePasskey() {
    const { preparePasskeyLogin } = await $zeus.mutate({
      preparePasskeyLogin: [
        { email },
        {
          allowCredentials: {
            id: true,
            type: true,
            transports: true,
          },
          challenge: true,
          extensions: {
            appid: true,
            credProps: true,
            hmacCreateSecret: true,
          },
          rpId: true,
          timeout: true,
          userVerification: true,
        },
      ],
    });

    if (!preparePasskeyLogin) return;

    const response = await startAuthentication({
      ...preparePasskeyLogin,
    } as PublicKeyCredentialCreationOptionsJSON);

    const { login } = await $zeus.mutate({
      login: [
        { email, passkey: response },
        {
          '__typename': true,
          '...on Error': { message: true },
          '...on MutationLoginSuccess': {
            data: { token: true },
          },
        },
      ],
    });

    if (login.__typename === 'Error') {
      errorMessages = [login.message];
      return;
    }

    window.localStorage.setItem('passkeyUserEmail', email);
    saveSessionToken(document, login.data);
    await redirect();
  }

  onMount(async () => {
    // Client-side redirect to avoid login detection
    if ($me) {
      window.localStorage.removeItem('isReallyLoggedout');
      await redirect();
    }

    email = window.localStorage.getItem('passkeyUserEmail') ?? '';
  });

  $: linkParams = email ? `?${new URLSearchParams({ email }).toString()}` : '';
</script>

<h1>Connexion</h1>

<form title="Se connecter" on:submit|preventDefault={login}>
  {#if $page.url.searchParams.has('to')}
    <Alert theme="warning">Cette page nécessite une connexion.</Alert>
  {/if}

  <Alert theme="danger" closed={errorMessages === undefined}>
    {errorMessages?.join(' ')}
  </Alert>
  <InputText
    required
    label="Adresse e-mail ou nom d'utilisateur"
    bind:value={email}
    autocomplete="username webauthn"
  />
  <InputText
    required
    type={showingPassword ? 'text' : 'password'}
    label="Mot de passe"
    autocomplete="current-password webauthn"
    bind:value={password}
    actionIcon={showingPassword ? IconEyeOff : IconEye}
    on:action={() => {
      showingPassword = !showingPassword;
    }}
  />
  <section class="submit">
    <ButtonPrimary submits>Se connecter</ButtonPrimary>
    <ButtonSecondary
      loading={passkeyLoading}
      icon={IconPasskey}
      on:click={async () => {
        passkeyLoading = true;
        try {
          await usePasskey();
        } catch (error) {
          toasts.error('Impossible de se connecter avec la clé de passe', error?.toString());
          window.localStorage.removeItem('passkeyUserEmail');
        } finally {
          passkeyLoading = false;
        }
      }}>Utiliser une clé de passe</ButtonSecondary
    >
  </section>

  <hr />
  <section class="actions">
    <ButtonSecondary href="./forgotten/{linkParams}">Mot de passe oublié</ButtonSecondary>
    <ButtonSecondary href="/register/{linkParams}">Créer un compte</ButtonSecondary>
  </section>
</form>

<style lang="scss">
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

  .submit {
    display: flex;
    flex-direction: column;
    row-gap: 1em;
    align-items: center;
    justify-content: center;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
</style>
