<script lang="ts">
  import { page } from '$app/stores';
  import Alert from '$lib/components/Alert.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

{#if data.error}
  <h1>Woops!</h1>
  <Alert theme="danger">Impossible de réclamer ce code: {data.error}</Alert>
{:else}
  <h1>Et voilà!</h1>
  <p>Ton code {$page.params.code} est bien effectif ;)</p>
{/if}
