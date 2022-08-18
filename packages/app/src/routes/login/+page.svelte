<script lang="ts">
  import { goto, invalidate } from '$app/navigation';
  import { page } from '$app/stores';
  import Alert from '$lib/components/alerts/Alert.svelte';
  import Button from '$lib/components/buttons/Button.svelte';
  import FormCard from '$lib/components/cards/FormCard.svelte';
  import { me, saveSessionToken, sessionUserQuery } from '$lib/session';
  import { zeus, ZeusError } from '$lib/zeus';
  import { onMount } from 'svelte';

  let email = '';
  let password = '';

  /** Redirects the user if a `to` parameter exists, or to "/" otherwise. */
  const redirect = async () => {
    let url = new URL($page.url.searchParams.get('to') ?? '/', $page.url);
    if (url.origin !== $page.url.origin || url.pathname.startsWith('/login/'))
      url = new URL('/', $page.url);
    return goto(url);
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
          { token: true, expiresAt: true, user: sessionUserQuery() },
        ],
      });
      saveSessionToken(login);
      await invalidate();
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
    if ($me) await redirect();
  });
</script>

<div class="flex justify-center">
  <FormCard on:submit={login}>
    <svelte:fragment slot="header">Se connecter</svelte:fragment>
    <Alert theme="danger" closed={errorMessages === undefined} inline>
      {errorMessages?.join(' ')}
    </Alert>
    <p><label>Adresse e-mail&nbsp;: <input type="text" bind:value={email} /></label></p>
    <p>
      <label>Mot de passe&nbsp;: <input type="password" bind:value={password} /></label>
    </p>
    <svelte:fragment slot="footer">
      <Button type="submit" theme="primary" {loading}>Se connecter</Button>
    </svelte:fragment>
  </FormCard>
</div>

<style lang="scss">
  input {
    display: block;
    width: 100%;
  }
</style>
