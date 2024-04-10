<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { onDestroy, onMount } from 'svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { me } from '$lib/session';

  let error: App.Error | null;
  let status: number;

  $: ({ error, status } = $page);

  onMount(() => {
    if (browser) {
      if (status === 404) document.documentElement.classList.add('error-404');
      document.documentElement.classList.add('errored');
    }
  });

  onDestroy(() => {
    if (browser) {
      if (status === 404) document.documentElement.classList.remove('error-404');
      document.documentElement.classList.remove('errored');
    }
  });
</script>

<div class="err-{status}">
  {#if status === 401}
    <h1>Erreur 401</h1>
    <p>Vous n'avez pas les droits requis pour accéder à cette page.</p>
    <p>
      Essayez de vous <ButtonSecondary href="/login?from={$page.url.pathname}"
        >connecter</ButtonSecondary
      > ?
    </p>
  {:else if status === 403}
    <h1>Erreur 403</h1>
    <p>Accès interdit.</p>
  {:else if status === 404}
    <img src="/404.svg" alt="404" />
    <p>Cette page n'existe pas.</p>
    <ButtonSecondary href="/">Retour à l'accueil</ButtonSecondary>
  {:else if error}
    <h1>Erreur {status}</h1>
    <p class="errortext">{error.message}</p>
    <div class="actions">
      <ButtonSecondary
        on:click={() => {
          window.location.reload();
        }}>Recharger</ButtonSecondary
      >
      {#if !$me}
        <ButtonSecondary href="/login?{new URLSearchParams({ to: $page.url.pathname })}"
          >Se connecter</ButtonSecondary
        >
      {/if}
    </div>
  {:else}
    <h1>Erreur {status}</h1>
    <p>C'est tout cassé.</p>
  {/if}
</div>

<style lang="scss">
  :global(body) {
    height: 100vh;
  }

  :global(.errored .page) {
    display: flex;
  }

  :global(.errored .layout) {
    flex: 1;
  }

  [class^='err-']:not(.err-404) {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .errortext {
    margin-bottom: 1rem;
  }

  .err-404 {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-family: var(--font-mono);
    color: var(--text);
    background-color: var(--bg);

    --bg: black;
    --text: #3edb46;
    --border: #107e0e;

    img {
      width: 100%;
      max-width: calc(min(80vw, 50vh));
      object-fit: contain;
    }

    p {
      margin: 0 1rem;
      font-size: 1.5rem;
      text-align: center;
    }
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;
  }
</style>
