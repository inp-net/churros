<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Alert from '$lib/components/Alert.svelte';
  import Button from '$lib/components/Button.svelte';

  import { me, saveSessionToken, sessionUserQuery } from '$lib/session';
  import { zeus } from '$lib/zeus';
  import { onMount } from 'svelte';

  let email = '';
  let password = '';

  /** Redirects the user if a `to` parameter exists, or to "/" otherwise. */
  const redirect = async () => {
    let url = new URL($page.url.searchParams.get('to') ?? '/', $page.url);
    if (url.origin !== $page.url.origin || url.pathname.startsWith('/login'))
      url = new URL('/', $page.url);
    return goto(url, { invalidateAll: true });
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
            __typename: true,
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

      saveSessionToken(login.data);
      await redirect();
    } finally {
      loading = false;
    }
  };

  onMount(async () => {
    // Client-side redirect to avoid login detection
    if ($me) await redirect();
  });

  $: linkParams = email ? `?${new URLSearchParams({ email }).toString()}` : '';
</script>

<div class="flex justify-center">
  <form title="Se connecter" on:submit={login}>
    <Alert theme="danger" closed={errorMessages === undefined} inline>
      {errorMessages?.join(' ')}
    </Alert>
    <p><label>Adresse e-mail&nbsp;: <input type="text" bind:value={email} /></label></p>
    <p>
      <label>Mot de passe&nbsp;: <input type="password" bind:value={password} /></label>
    </p>
    <p class="text-center">
      <Button type="submit" theme="primary" {loading}>Se connecter</Button>
    </p>
    <footer>
      <a href="./forgotten/{linkParams}">Mot de passe oublié</a>
      • <a href="/register/{linkParams}">S'inscrire</a>
    </footer>
  </form>
</div>

<style lang="scss">
  input {
    display: block;
    width: 100%;
  }
</style>
