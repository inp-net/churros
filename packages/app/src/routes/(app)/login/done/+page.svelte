<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { cache } from '$houdini';
  import { LoadingChurros } from '$lib/loading';
  import { route } from '$lib/ROUTES';
  import { onMount } from 'svelte';

  onMount(async () => {
    cache.reset();
    console.log('redirect after login finished from', $page.url.searchParams.get('from'));
    await goto($page.url.searchParams.get('from') || route('/'));
  });
</script>

<div class="loading">
  <LoadingChurros />
  <p>Connexion…</p>
</div>

<style>
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    font-size: 7rem;
  }

  .loading p {
    margin-top: 2rem;
    font-size: 1.5rem;
    font-weight: bold;
    background: linear-gradient(90deg, var(--fg), var(--primary), var(--fg));
    background-clip: text;
    -webkit-text-fill-color: transparent;
    /* stylelint-disable-next-line */
    text-fill-color: transparent;
    background-size: 200% auto;
    animation: textgradient 1s linear infinite reverse;
  }

  @keyframes textgradient {
    to {
      background-position: 200% center;
    }
  }
</style>
