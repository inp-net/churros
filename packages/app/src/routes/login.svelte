<script lang="ts">
  import { goto } from '$app/navigation';
  import { page, session } from '$app/stores';
  import Alert from '$lib/components/Alert.svelte';
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';
  import { saveSessionToken, sessionUserQuery } from '$lib/session';
  import { mutate, ZeusError } from '$lib/zeus';
  import { onMount } from 'svelte';

  let name = '';
  let password = '';

  /** Redirects the user if a `to` parameter exists, or to "/" otherwise. */
  const redirect = async () => {
    let url = new URL($page.url.searchParams.get('to') ?? '/', $page.url);
    if (url.origin !== $page.url.origin) url = new URL('/', $page.url);
    return goto(url);
  };

  let loading = false;
  let errorMessages: string[] | undefined;
  const login = async () => {
    if (loading) return;

    try {
      loading = true;
      errorMessages = undefined;
      const { login } = await mutate({
        login: [
          { name, password },
          { token: true, expiresAt: true, user: sessionUserQuery() },
        ],
      });
      saveSessionToken(login);
      $session.token = login.token;
      $session.me = login.user;
      await redirect();
    } catch (error: unknown) {
      if (!(error instanceof ZeusError)) throw error;
      errorMessages = error.errors.map(({ message }) => message);
    } finally {
      loading = false;
    }
  };

  onMount(async () => {
    // Client-side redirect to avoid login detection
    if ($session.me) await redirect();
  });
</script>

<div class="flex justify-center">
  <form on:submit|preventDefault={login}>
    <Card>
      <h1 slot="header" class="text-center">Se connecter</h1>
      <Alert theme="danger" closed={errorMessages === undefined}>
        <p>{errorMessages?.join(' ')}</p>
      </Alert>
      <p><label>Adresse e-mail&nbsp;: <input type="text" bind:value={name} /></label></p>
      <p>
        <label>Mot de passe&nbsp;: <input type="password" bind:value={password} /></label>
      </p>
      <p class="text-center">
        <Button type="submit" theme="primary" {loading}>Se connecter</Button>
      </p>
    </Card>
  </form>
</div>

<style lang="scss">
  form {
    width: 24rem;
    max-width: 100%;
    padding: 0 1rem;
  }

  h1 {
    padding: 1rem;
    margin-top: 0;
    overflow: hidden;
    background-color: #eee;
    box-shadow: 0 0 0.25rem #0006;
  }

  input {
    display: block;
    width: 20rem;
  }
</style>
