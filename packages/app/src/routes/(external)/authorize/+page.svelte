<script lang="ts">
  import { page } from '$app/stores';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import LogoChurros from '$lib/components/LogoChurros.svelte';
  import { dateFormatter } from '$lib/dates';
  import { zeus } from '$lib/zeus';

  const clientId = $page.url.searchParams.get('client_id') ?? '';
  const redirectUri = $page.url.searchParams.get('redirect_uri') ?? '';
</script>

<main>
  <section class="logo">
    <LogoChurros />
  </section>
  <h1>“{clientId}” souhaite accéder à ton compte Churros</h1>

  <section class="accept">
    <ButtonPrimary
      on:click={async () => {
        const { authorize: token } = await $zeus.mutate({
          authorize: [{ clientId, redirectUri }, true],
        });
        window.location.href = redirectUri + '?token=' + token;
      }}>Autoriser</ButtonPrimary
    >
  </section>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    height: calc(max(50vh, 400px));
    margin: auto;
    padding: 3rem;
    flex-grow: 1;
    border-radius: var(--radius-block);
    border: 1px solid var(--muted-border);
    max-width: 30rem;
    background: var(--bg);
  }


  section.logo {
    height: 4rem;
    margin-bottom: 2rem;
  }

  section.accept {
    display: flex;
    justify-content: center;
  }
</style>
