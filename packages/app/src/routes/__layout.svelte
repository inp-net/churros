<script lang="ts">
  import { navigating, session } from '$app/stores';
  import BurgerButton from '$lib/components/buttons/BurgerButton.svelte';
  import Nav from '$lib/layout/Nav.svelte';
  import TopBar from '$lib/layout/TopBar.svelte';
  import { theme } from '$lib/theme.js';
  import { onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
  import 'virtual:windi.css';
  import '../design/app.scss';

  let { mobile } = $session;
  const onResize = () => {
    mobile = !window.matchMedia('(min-width: 50rem)').matches;
  };

  onMount(onResize);

  let menuOpen = false;
  let menuWidth = 0;
  const menuOpenness = tweened(0, { duration: 80 });
  let start: Touch | undefined;
  let startedAt = 0;
  let diff: { x: number; y: number } | undefined;

  $: if ($navigating || !mobile) menuOpen = false;
  $: $menuOpenness = menuOpen ? 1 : 0;

  onMount(() => {
    let currentTheme = $theme;
    theme.subscribe(($theme) => {
      if (currentTheme) document.documentElement.classList.remove(currentTheme);
      document.documentElement.classList.add($theme);
      currentTheme = $theme;
    });
  });
</script>

<svelte:window
  on:resize={onResize}
  on:touchstart={({ touches }) => {
    if (touches.length !== 1) return;
    start = touches[0];
    startedAt = window.performance.now();
    diff = { x: 0, y: 0 };
  }}
  on:touchmove={({ changedTouches }) => {
    if (!start || !diff) return;
    const touch = [...changedTouches].find(({ identifier }) => identifier === start?.identifier);
    if (!touch) return;

    diff = { x: touch.clientX - start.clientX, y: touch.clientY - start.clientY };
    if (Math.abs(diff.x) > 2 * Math.abs(diff.y)) {
      void menuOpenness.set((menuOpen ? 1 : 0) + diff.x / menuWidth, { duration: 0 });
    } else {
      $menuOpenness = menuOpen ? 1 : 0;
      diff = undefined;
    }
  }}
  on:touchend={({ touches }) => {
    if (!diff) return;
    if ([...touches].some(({ identifier }) => identifier === start?.identifier)) return;

    menuOpen =
      Math.abs(diff.x) > Math.max(2 * Math.abs(diff.y), menuWidth / 20) &&
      window.performance.now() - startedAt < 300
        ? diff.x > 0
        : $menuOpenness >= 0.5;
    $menuOpenness = menuOpen ? 1 : 0;

    diff = undefined;
  }}
/>

{#if mobile}
  <div class="top-0 left-0 z-10 fixed">
    <BurgerButton
      openness={$menuOpenness}
      on:click={() => {
        menuOpen = !menuOpen;
      }}
    />
  </div>
{/if}

<TopBar {mobile} />

{#if mobile}
  <div
    class="mobile-background"
    hidden={$menuOpenness === 0}
    style:opacity={$menuOpenness}
    on:click={() => {
      menuOpen = false;
      $menuOpenness = 0;
    }}
  />
  <div
    class="mobile-menu"
    style:transform="translateX(-{(1 - $menuOpenness) * 100}%)"
    hidden={$menuOpenness === 0}
    bind:clientWidth={menuWidth}
  >
    <div class="flex-shrink-0 h-10" />
    <div class="flex-shrink flex-1 px-2 overflow-auto overscroll-contain">
      <Nav />
    </div>
  </div>
{/if}

<div class="layout">
  {#if !mobile}
    <div class="min-w-48">
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
    right: 8rem;
    z-index: 1;
    display: flex;
    flex-direction: column;
    min-width: 12rem;
    max-width: 20rem;
    background: var(--bg);
    box-shadow: var(--shadow);
  }

  .layout {
    display: grid;
    grid-template-columns: 1fr minmax(0, 60rem) 1fr;
    max-width: 100rem;
    padding: 0 0.5rem;
    margin: auto;

    > * {
      padding: 0 0.5rem;
    }
  }
</style>
