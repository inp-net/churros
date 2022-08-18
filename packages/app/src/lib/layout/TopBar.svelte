<script lang="ts">
  import { navigating, page } from '$app/stores';
  import type { LayoutData } from '.svelte-kit/types/src/routes/$types';
  import { expoOut } from 'svelte/easing';
  import { derived } from 'svelte/store';
  import { fly } from 'svelte/transition';

  export let mobile = false;

  $: ({ me, token } = $page.data as LayoutData);

  let timeout: unknown;
  const showLoader = derived(
    navigating,
    ($navigating, set) => {
      if (timeout !== undefined) clearTimeout(timeout as number);
      if ($navigating) {
        timeout = setTimeout(() => {
          set(true);
        }, 200);
      } else {
        set(false);
      }
    },
    false
  );
</script>

<div class="top-bar">
  <div class="flex mx-auto max-w-[100rem] p-4 justify-between">
    <div class="flex gap-4 items-center">
      {#if mobile}
        <div class="w-6" />
      {/if}
      <a href="/" sveltekit:prefetch>(logo)</a>
    </div>
    <div>
      {#if me && token}
        <a href="/me" sveltekit:prefetch>{me.firstName}</a>
        <a href="/logout?{new URLSearchParams({ token })}">Se déconnecter</a>
      {:else}
        <a href="/login?{new URLSearchParams({ to: $page.url.pathname })}" sveltekit:prefetch>
          Se connecter
        </a>
        <a href="/register" sveltekit:prefetch>S'inscrire</a>
      {/if}
    </div>
  </div>
  {#if $showLoader}
    <div
      class="loader"
      in:fly={{ x: -window.innerWidth, duration: 3000, easing: expoOut, opacity: 1 }}
      out:fly={{ x: 0.1 * window.innerWidth, duration: 300 }}
    />
  {/if}
</div>

<style lang="scss">
  .top-bar {
    position: sticky;
    top: 0;
    z-index: 1;
    max-width: 100%;
    overflow: hidden;
    color: var(--primary-text);
    background: var(--primary-bg);
    box-shadow: var(--primary-shadow);

    a {
      color: inherit;
    }
  }

  .loader {
    position: absolute;
    bottom: 0;
    left: -10vw;
    width: 100%;
    height: 0.25rem;
    background: var(--loading-bg);
  }
</style>
