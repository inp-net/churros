<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import { cache } from '$houdini';
  import LoadingScreen from '$lib/components/LoadingScreen.svelte';
  import { route } from '$lib/ROUTES';
  import { onMount } from 'svelte';

  onMount(async () => {
    cache.reset();
    await invalidateAll();
    await goto($page.url.searchParams.get('from') || route('/'));
  });
</script>

<LoadingScreen title="Connexion…" />
