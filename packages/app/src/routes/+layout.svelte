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
    theme.subscribe(($theme) => {
      if (currentTheme) document.documentElement.classList.remove(currentTheme);
      if ($theme === 'system') {
        document.documentElement.classList.add(
          window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        );
      } else {
        document.documentElement.classList.add($theme);
      }

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
  .layout {
    // max-width: 100rem;
    padding-top: 6rem; // XXX equal to topbar's height
    padding-bottom: 5rem; /// XXX equal to navbar's height
    margin: auto;

    > * {
      padding: 0 0.5rem;
    }
  }
</style>
