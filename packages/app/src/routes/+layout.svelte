<script lang="ts">
  import { browser } from '$app/environment';
  import { beforeNavigate } from '$app/navigation';
  import { updated } from '$app/stores';
  import AnalyticsTracker from '$lib/components/AnalyticsTracker.svelte';
  import ModalReportIssue from '$lib/components/ModalReportIssue.svelte';
  import ModalThemeVariables from '$lib/components/ModalThemeVariables.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import { debugging, themeDebugger } from '$lib/debugging';
  import { setupIsMobile } from '$lib/mobile';
  import '$lib/polyfills';
  import { setSentryUser } from '$lib/sentry';
  import { theme } from '$lib/theme.js';
  import { toasts } from '$lib/toasts';
  import { onMount } from 'svelte';
  import '../design/app.scss';
  import type { LayoutData } from './$houdini';

  export let data: LayoutData;
  $: ({ RootLayout } = data);

  $: if ($RootLayout.data?.autodeployedTheme) {
    const newTheme = $RootLayout.data.autodeployedTheme;
    const oldTheme = structuredClone($theme);
    if (oldTheme.id !== newTheme.localID) {
      toasts.info(
        'Nouveau thème appliqué!',
        `Rends-toi dans tes réglages pour changer si il ne te plaît pas`,
        {
          lifetime: 10_000,
          labels: {
            close: 'Ok!',
          },
        },
      );
    }
    $theme.id = newTheme.localID;
  }

  $: setSentryUser($RootLayout.data?.me ?? null);

  // @ts-expect-error houdini's $type does not include layout data from server load
  setupIsMobile(data.mobile);

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

  onMount(() => {
    document.querySelector('#loading-overlay')?.classList.remove('visible');
    setTimeout(() => {
      document.querySelector('#loading-overlay')?.remove();
      document.body.classList.remove('loading');
    }, 1000);
  });

  beforeNavigate(async ({ willUnload, to }) => {
    // See https://kit.svelte.dev/docs/configuration#version
    if ($updated && !willUnload && to?.url) location.href = to.url.href;
  });

  onMount(() => {
    theme.subscribe(($theme) => {
      const selectedVariant =
        $theme.variant === 'auto'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : $theme.variant;
      document.documentElement.dataset.theme = $theme.id;
      document.documentElement.dataset.themeVariant = selectedVariant;
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
  let openIssueReport: () => void;
</script>

<svelte:window on:NAVTOP_REPORT_ISSUE={openIssueReport} />

<svelte:head>
  <title>Churros</title>
  <AnalyticsTracker user={$RootLayout.data?.me ?? null} />
</svelte:head>

<div data-vaul-drawer-wrapper="">
  {#if browser}
    <section class="toasts">
      {#each $toasts as toast (toast.id)}
        <Toast
          on:action={async () => {
            if (toast.callbacks.action) await toast.callbacks.action(toast);
          }}
          {toast}
        ></Toast>
      {/each}
    </section>
  {/if}

  {#if $themeDebugger}
    <ModalThemeVariables />
  {/if}

  <ModalReportIssue bind:open={openIssueReport} />

  <slot />
</div>

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

  [data-vaul-drawer-wrapper] {
    position: relative;
    background-color: var(--bg);
  }
</style>
