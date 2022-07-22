<script lang="ts">
  import { navigating, page, session } from '$app/stores';
  import { theme } from '$lib/theme';
  import { createEventDispatcher } from 'svelte';
  import { expoOut } from 'svelte/easing';
  import { derived } from 'svelte/store';
  import { fly } from 'svelte/transition';

  export let mobile = false;

  const dispatch = createEventDispatcher<{ openMenu: undefined }>();

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
  <div class="flex mx-auto max-w-[100rem] justify-between">
    <div>
      {#if mobile}
        <button on:click={() => dispatch('openMenu')}>≡</button>
      {/if}
      <a href="/" sveltekit:prefetch>Accueil</a>
      <a href="/search/">🔍</a>
    </div>
    <div>
      {#if $session.me && $session.token}
        <a href="/me" sveltekit:prefetch>{$session.me.name}</a>
        <a href="/logout?{new URLSearchParams({ token: $session.token })}"> Se déconnecter </a>
      {:else}
        <a href="/login?{new URLSearchParams({ to: $page.url.pathname })}" sveltekit:prefetch>
          Se connecter
        </a>
        <a href="/register" sveltekit:prefetch>S'inscrire</a>
      {/if}
      <button
        on:click={() => {
          $theme = $theme === 'dark' ? 'light' : 'dark';
        }}
        on:dblclick={() => {
          $theme = 'pride';
        }}>{$theme === 'pride' ? '🌈' : $theme === 'dark' ? '☀️' : '🌙'}</button
      >
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
    max-width: 100%;
    padding: 1em;
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
