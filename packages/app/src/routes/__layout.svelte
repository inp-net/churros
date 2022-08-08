<script lang="ts">
  import { navigating, session } from '$app/stores';
  import BurgerButton from '$lib/components/buttons/BurgerButton.svelte';
  import Nav from '$lib/layout/Nav.svelte';
  import TopBar from '$lib/layout/TopBar.svelte';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import 'virtual:windi.css';
  import '../design/app.scss';

  $: ({ mobile } = $session);
  let menuOpen = false;

  const onResize = () => {
    if (window.matchMedia('(max-width: 50rem)').matches) {
      mobile = true;
    } else {
      if (mobile) menuOpen = false;
      mobile = false;
    }
  };

  onMount(onResize);
  $: if ($navigating) menuOpen = false;
</script>

<svelte:window on:resize={onResize} />

{#if mobile}
  <div class="top-0 left-0 z-10 fixed">
    <BurgerButton
      open={menuOpen}
      on:click={() => {
        menuOpen = !menuOpen;
      }}
    />
  </div>
{/if}

<TopBar {mobile} />

{#if mobile && menuOpen}
  <div
    class="mobile-background"
    transition:fade
    on:click={() => {
      menuOpen = false;
    }}
  />
  <div class="mobile-menu" transition:fly={{ x: -window.innerWidth }}>
    <div class="flex-shrink-0 h-12" />
    <div class="flex-shrink flex-1 overflow-auto overscroll-contain">
      <Nav />
    </div>
  </div>
{/if}

<div class="layout">
  {#if !mobile}
    <div class="min-w-50">
      <Nav />
    </div>
  {/if}
  <main>
    <slot />
  </main>
</div>

<style lang="scss">
  main {
    grid-column: 2;
  }

  .mobile-background {
    position: fixed;
    inset: 0;
    z-index: 1;
    background: rgb(0 0 0 / 50%);
  }

  .mobile-menu {
    position: fixed;
    inset: 0;
    right: 10rem;
    z-index: 1;
    display: flex;
    flex-direction: column;
    min-width: 15rem;
    max-width: 30rem;
    background: var(--bg);
    box-shadow: var(--shadow);
  }

  .layout {
    display: grid;
    grid-template-columns: 1fr minmax(0, 60rem) 1fr;
    gap: 0.5rem;
    max-width: 100rem;
    padding: 0.5rem;
    margin: auto;
  }
</style>
