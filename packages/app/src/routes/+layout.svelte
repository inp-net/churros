<script lang="ts">
  import { browser } from '$app/environment';
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import AnalyticsTracker from '$lib/components/AnalyticsTracker.svelte';
  import ModalThemeVariables from '$lib/components/ModalThemeVariables.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import { debugging, themeDebugger } from '$lib/debugging';
  import { theme } from '$lib/theme.js';
  import { toasts } from '$lib/toasts';
  import { onMount } from 'svelte';
  import '../design/app.scss';
  import type { LayoutData } from './$houdini';

  export let data: LayoutData;
  $: ({ RootLayout } = data);

  onMount(() => {
    // if (!$me && !localStorage.getItem('isReallyLoggedout')) {
    //   localStorage.setItem('isReallyLoggedout', 'true');
    //   window.location.reload();
    // } else if ($me) {
    //   localStorage.removeItem('isReallyLoggedout');
    // }

    debugging.subscribe(($debugging) => {
      document.documentElement.classList.toggle('rainbow-logo', $debugging);
    });
  });

  type NProgress = {
    start: () => void;
    done: () => void;
    remove: () => void;
  };

  beforeNavigate(async () => {
    const { NProgress } = window as unknown as Window & { NProgress: NProgress };

    NProgress.start();
  });

  afterNavigate(async () => {
    const { NProgress } = window as unknown as Window & { NProgress: NProgress };

    NProgress.done();
    setTimeout(() => {
      NProgress.remove();
    }, 1000);
  });

  onMount(() => {
    let currentTheme = $theme;
    theme.subscribe(($theme) => {
      if (currentTheme) document.documentElement.classList.remove(currentTheme);
      const selectedTheme =
        $theme === 'system'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : $theme;
      document.documentElement.classList.add(selectedTheme);

      currentTheme = $theme;
    });

    if (browser && window.location.hostname === 'staging-churros.inpt.fr') {
      toasts.warn(
        "T'es en staging",
        'Tu sais pas ce que ça veut dire? reviens sur churros.inpt.fr.',
        {
          data: {},
          lifetime: Number.POSITIVE_INFINITY,
          showLifetime: true,
        },
      );
    }

    if (browser && window.location.hostname === 'localhost') {
      toasts.debug("T'es en dev", '', {
        data: {},
        lifetime: 2000,
      });
    }
  });
</script>

<svelte:head>
  <title>Churros</title>
  <AnalyticsTracker user={$RootLayout.data?.me ?? null} />
</svelte:head>

{#if browser}
  <section class="toasts">
    {#each $toasts as toast (toast.id)}
      <Toast
        on:action={async () => {
          if (toast.callbacks.action) await toast.callbacks.action(toast);
        }}
        action={toast.labels.action}
        closeLabel={toast.labels.close}
        {...toast}
      ></Toast>
    {/each}
  </section>
{/if}

{#if $themeDebugger}
  <ModalThemeVariables />
{/if}

<slot />

<style lang="scss">
  section.toasts {
    position: fixed;
    bottom: 75px;
    left: 50%;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    max-width: 600px;
    padding: 0 1rem;
    transform: translateX(-50%);

    @media (min-width: 1000px) {
      right: 0;
      bottom: 6rem;
      left: unset;
      max-width: 700px;
      padding: 0 2rem 0 0;
      transform: unset;
    }
  }
</style>
