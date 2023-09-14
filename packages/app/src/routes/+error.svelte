<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  let error: App.Error | null;
  let status: number;

  $: ({ error, status } = $page);

  onMount(() => {
    if (status === 404) document.documentElement.classList.add('error-404');
  });
</script>

{#if status === 404}
  <style>
    :root.error-404 {
      --bg: #000;
      --text: #25bf22;
      --border: #25bf22;
      --primary-link: #54fe54;
    }

    .page {
      display: flex;
    }

    .layout {
      flex: 1;
    }
  </style>
{/if}

{#if status === 401}
  <h1>Erreur 401</h1>
  <p>Vous n'avez pas les droits requis pour accéder à cette page.</p>
{:else if status === 403}
  <h1>Erreur 403</h1>
  <p>Accès interdit.</p>
{:else if status === 404}
  <div class="err-404">
    <img src="/404.svg" alt="404" />
    <p>Cette page n'existe pas.</p>
  </div>
{:else if error}
  <h1>Erreur {status}</h1>
  <p>{error.message}</p>
{:else}
  <h1>Erreur {status}</h1>
  <p>C'est tout cassé.</p>
{/if}

<style lang="scss">
  .err-404 {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: black;

    img {
      width: 100%;
      max-width: calc(min(80vw, 50vh));
      object-fit: contain;
    }

    p {
      margin: 0 1rem;
      font-family: var(--font-mono);
      font-size: 1.5rem;
      color: #25bf22;
      text-align: center;
    }
  }
</style>
