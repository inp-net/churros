<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Alert from '$lib/components/Alert.svelte';
  import LoadingChurros from '$lib/components/LoadingChurros.svelte';
  import { route } from '$lib/ROUTES';
  import { toasts } from '$lib/toasts';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  onMount(() => {
    if (!data.error) {
      toasts.success('Et voilà!', 'Tu es maintenant manager de cet évènement');
      goto(route('/events/[id]', $page.params.id), {});
    }
  });
</script>

<div class="contents">
  {#if data.error}
    <h1>Woops!</h1>
    <Alert theme="danger"
      >Impossible d'utiliser cette invitation: {data.error ?? 'Erreur inattendue'}</Alert
    >
  {:else}
    <LoadingChurros />
  {/if}
</div>

<style>
  .contents {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100%;
  }
</style>
