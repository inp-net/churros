<script lang="ts">
  import { goto } from '$app/navigation';
  import { LoadingChurros } from '$lib/loading';
  import { page } from '$app/stores';
  import { cache } from '$houdini';
  import { route } from '$lib/ROUTES';
  import { onMount } from 'svelte';

  onMount(async () => {
    cache.reset();
    await goto($page.url.searchParams.get('from') || route('/'));
  });
</script>

<div class="loading">
  <LoadingChurros />
</div>
