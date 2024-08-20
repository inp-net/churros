<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { cache } from '$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import { mutationErrorMessages, mutationSucceeded } from '$lib/errors';
  import { route } from '$lib/ROUTES';
  import { saveSessionToken } from '$lib/session';
  import IconEye from '~icons/mdi/eye';
  import IconEyeOff from '~icons/mdi/eye-off';
  import { Login } from './mutations';

  let email = '';
  let password = '';
  let showingPassword = false;

  /** Redirects the user if a `to` parameter exists, or to "/" otherwise. */
  const redirect = async () => {
    let url = new URL(
      $page.url.searchParams.get('to') ?? $page.url.searchParams.get('from') ?? '/',
      $page.url,
    );
    if (url.origin !== $page.url.origin || url.pathname.startsWith('/login'))
      url = new URL('/', $page.url);
    const searchParams = new URLSearchParams(
      [...$page.url.searchParams.entries()].filter(([k]) => k !== 'to' && k !== 'from'),
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
      const result = await Login.mutate({
        emailOrUid: email,
        password,
      });

      if (mutationSucceeded('login', result)) {
        saveSessionToken(document, {
          ...result.data.login.data,
          expiresAt: result.data.login.data.expiresAt ?? null,
        });
        cache.reset();
        await redirect();
      }

      if (result.data?.login.__typename === 'AwaitingValidationError') {
        errorMessages = [
          "Ton compte n'a pas encore été validé par l'équipe d'administration de ton AE. Encore un peu de patience 😉",
        ];
        return;
      }

      errorMessages = mutationErrorMessages('login', result);
    } finally {
      loading = false;
    }
  };
</script>

<h1>Connexion</h1>

<form title="Se connecter" on:submit|preventDefault={login}>
  {#if $page.url.searchParams.get('why') === 'unauthorized'}
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
    <ButtonPrimary submits
      >{#if migratingPassword}Migrer{:else}Se connecter{/if}</ButtonPrimary
    >
  </section>

  <hr />
  <section class="actions">
    <ButtonSecondary href={route('/login/forgotten')}>Mot de passe oublié</ButtonSecondary>
    <ButtonSecondary href={route('/signup')}>S'inscrire</ButtonSecondary>
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
