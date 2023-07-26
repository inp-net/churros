<script lang="ts">
  import { page } from '$app/stores';
  import TopBar from '$lib/components/NavigationTop.svelte';
  import { theme } from '$lib/theme.js';
  import { onMount } from 'svelte';
  import '../design/app.scss';
  import type { LayoutData } from './$types';
  import NavigationBottom from '$lib/components/NavigationBottom.svelte';

  let { mobile } = $page.data as LayoutData;
  const onResize = () => {
    mobile = !window.matchMedia('(min-width: 50rem)').matches;
  };

  onMount(onResize);

  function currentTab(url: URL): 'events' | 'search' | 'more' | 'home' {
    const starts = (segment: string) => url.pathname.startsWith(segment);

    if (starts('/search')) return 'search';
    if (starts('/week') || starts('/bookings') || starts('/events')) return 'events';
    if (starts('/more')) return 'more';
    return 'home';
  }

  onMount(() => {
    let currentTheme = $theme;
    $theme = 'light';
    theme.subscribe(($theme) => {
      if (currentTheme) document.documentElement.classList.remove(currentTheme);
      document.documentElement.classList.add($theme);
      currentTheme = $theme;
    });
  });
</script>

<svelte:window on:resize={onResize} />

<svelte:head>
  <title>Centraverse</title>
</svelte:head>

<TopBar />

<div class="layout">
  <main>
    <slot />
  </main>
</div>

<NavigationBottom current={currentTab($page.url)} />

<style lang="scss">
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
    max-width: 100rem;
    padding-top: 6rem; // XXX equal to topbar's height
    padding-bottom: 5rem; /// XXX equal to navbar's height
    margin: auto;

    > * {
      padding: 0 0.5rem;
    }
  }
</style>
