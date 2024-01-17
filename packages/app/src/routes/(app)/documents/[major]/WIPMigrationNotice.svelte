<script lang="ts">
  import { page } from '$app/stores';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
</script>

{#if $page.params.major === '3ea'}
  <Alert theme="warning">
    <h2 class="migration-notice">Frappe des 3EAs en cours de migration</h2>
    Les parcours de 3EA on été complètement repensés récemment. On a besoin de votre aide pour migrer
    correctement les documents depuis l'ancienne Frappe. <ButtonInk
      insideProse
      href="/documents/3ea">En savoir plus</ButtonInk
    >
  </Alert>
{/if}

<style>
  h2 {
    margin-bottom: 1rem;
  }
</style>
