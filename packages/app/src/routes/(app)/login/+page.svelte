<script lang="ts">
  import { page } from '$app/stores';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import { route } from '$lib/ROUTES';
  import IconEye from '~icons/mdi/eye';
  import IconEyeOff from '~icons/mdi/eye-off';
  import type { ActionData } from './$types';

  export let form: ActionData;
  let showingPassword = false;

  $: migratingPassword = $page.url.searchParams.has('migrate');
</script>

<h1>
  {#if migratingPassword}Migration{:else}Connexion{/if}
</h1>

<form title="Se connecter" method="post">
  {#if $page.url.searchParams.get('why') === 'unauthorized'}
    <Alert theme="warning">Cette page nécessite une connexion.</Alert>
  {/if}

  <Alert theme="danger" closed={form?.serverErrors === undefined || form.serverErrors.length === 0}>
    {form?.serverErrors?.join(' ')}
  </Alert>
  <InputText value="" name="email" required label="Adresse e-mail ou nom d'utilisateur" autofocus />
  <InputText
    value=""
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
