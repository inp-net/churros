<script lang="ts">
  import { page } from '$app/stores';

  let error: App.PageError | null;
  let status: number;

  $: ({ error, status } = $page);
</script>

{#if status === 401}
  <h1>Erreur 401</h1>
  <p>Vous n'avez pas les droits requis pour accéder à cette page.</p>
{:else if status === 403}
  <h1>Erreur 403</h1>
  <p>Accès interdit.</p>
{:else if status === 404}
  <h1>Erreur 404</h1>
  <p>Cette page n'existe pas.</p>
{:else if error}
  <h1>Erreur {status}</h1>
  <p>{error.message}</p>
{:else}
  <h1>Erreur {status}</h1>
  <p>C'est tout cassé.</p>
{/if}
