<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import IconEye from '~icons/mdi/eye';
  import IconEyeOff from '~icons/mdi/eye-off';

  import { me, saveSessionToken, sessionUserQuery } from '$lib/session';
  import { zeus } from '$lib/zeus';
  import { onMount } from 'svelte';

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
            '...on AwaitingValidationError': { __typename: true },
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

      if (login.__typename === 'AwaitingValidationError') {
        errorMessages = [
          "Ton compte n'a pas encore été validé par l'équipe d'administration de ton AE. Encore un peu de patience 😉",
        ];
        return;
      }

      saveSessionToken(document, { ...login.data, expiresAt: login.data.expiresAt ?? null });
      await redirect();
    } finally {
      loading = false;
    }
  };

  onMount(async () => {
    // Client-side redirect to avoid login detection
    if ($me) {
      window.localStorage.removeItem('isReallyLoggedout');
      await redirect();
    }
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
  <InputText required label="Adresse e-mail ou nom d'utilisateur" bind:value={email} autofocus />
  <InputText
    required
    type={showingPassword ? 'text' : 'password'}
    label="Mot de passe"
    bind:value={password}
    actionIcon={showingPassword ? IconEyeOff : IconEye}
    on:action={() => {
      showingPassword = !showingPassword;
    }}
  />
  <section class="submit">
    <ButtonPrimary submits>Se connecter</ButtonPrimary>
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
    justify-content: center;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
</style>
