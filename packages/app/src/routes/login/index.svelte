<script lang="ts">
  import { goto } from '$app/navigation';
  import { page, session } from '$app/stores';
  import Alert from '$lib/components/alerts/Alert.svelte';
  import Button from '$lib/components/buttons/Button.svelte';
  import FormCard from '$lib/components/cards/FormCard.svelte';
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
    <FormCard on:submit={login}>
      <svelte:fragment slot="header">Se connecter</svelte:fragment>
      <Alert theme="danger" closed={errorMessages === undefined} inline>
        {errorMessages?.join(' ')}
      </Alert>
      <p><label>Adresse e-mail&nbsp;: <input type="text" bind:value={name} /></label></p>
      <p>
        <label>Mot de passe&nbsp;: <input type="password" bind:value={password} /></label>
      </p>
      <svelte:fragment slot="footer">
        <Button type="submit" theme="primary" {loading}>Se connecter</Button>
      </svelte:fragment>
    </FormCard>
  </form>
</div>

<style lang="scss">
  input {
    display: block;
    width: 100%;
  }
</style>
