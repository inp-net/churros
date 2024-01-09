<script lang="ts">
  import { browser } from '$app/environment';
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import { CURRENT_COMMIT, CURRENT_VERSION } from '$lib/buildinfo';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import { debugging } from '$lib/debugging';
  import { me } from '$lib/session';
  import { isDark, theme } from '$lib/theme.js';
  import { toasts } from '$lib/toasts';
  import { onMount } from 'svelte';
  import IconLoading from '~icons/mdi/loading';
  import '../design/app.scss';
  import { isPWA } from '$lib/pwa';

  let showInitialSpinner = true;

  onMount(() => {
    if (!$me && !localStorage.getItem('isReallyLoggedout')) {
      localStorage.setItem('isReallyLoggedout', 'true');
      window.location.reload();
    } else if ($me) {
      localStorage.removeItem('isReallyLoggedout');
      showInitialSpinner = false;
    } else {
      showInitialSpinner = false;
    }

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
  <title>AEn7</title>
  <script
    defer
    src="https://stats.ewen.works/js/script.pageview-props.outbound-links.js"
    data-domain="churros.inpt.fr"
  ></script>
  <script
    async
    src="https://stats.inpt.fr/script.js"
    data-website-id="e3bd5b08-b0a3-47ff-a274-1df9ba831c3e"
    data-domains="churros.inpt.fr"
    data-event-loggedin={$me ? 'true' : 'false'}
    data-event-theme={$theme}
    data-event-darkmode={$isDark ? 'true' : 'false'}
    data-event-version={CURRENT_VERSION}
    data-event-commit={CURRENT_COMMIT}
    data-event-user-major={$me?.major?.shortName ?? '(none)'}
    data-event-user-year-tier={$me?.yearTier ? `${$me.yearTier}A` : '(none)'}
    data-event-context={isPWA() ? 'pwa' : 'browser'}
  ></script>
</svelte:head>

<div id="loading-overlay" class:visible={showInitialSpinner}>
  <img src="/splash-screen.png" alt="AEn7" />
  <div class="spinner">
    <IconLoading />
  </div>
  <p class="typo-details">Connexion en cours…</p>
  <p class="troubleshoot">
    Si ce message reste affiché longtemps: <ButtonSecondary
      insideProse
      on:click={() => {
        window.location.reload();
      }}>Recharger</ButtonSecondary
    >
  </p>
</div>

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

<slot />

<style lang="scss">
  #loading-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000000000000000;
    display: flex;
    flex-flow: column wrap;
    gap: 1.5rem;
    align-items: center;
    justify-content: center;
    color: var(--primary-text);
    background: var(--primary-bg);

    .spinner {
      font-size: 2rem;
      animation: spinner 700ms infinite;
    }

    img {
      object-fit: contain;
      height: 10rem;
    }

    .troubleshoot {
      position: absolute;
      bottom: 4rem;

      --bg: transparent;
      --border: var(--primary-text);
      --text: var(--primary-text);

      text-align: center;
    }
  }

  #loading-overlay:not(.visible) {
    display: none;
  }

  @media not all and (display-mode: standalone) {
    #loading-overlay {
      display: none;
    }
  }

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
