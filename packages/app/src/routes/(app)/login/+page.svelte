<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
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

  let showingPassword = false;

  let password: string;
  let email: string;
  let serverError = '';

  $: migratingPassword = $page.url.searchParams.has('migrate');
</script>

<h1>
  {#if migratingPassword}Migration{:else}Connexion{/if}
</h1>

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

  <Alert theme="danger" closed={!serverError}>
    {serverError}
  </Alert>
  <InputText
    bind:value={email}
    name="email"
    required
    label="Adresse e-mail ou nom d'utilisateur"
    autofocus
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
