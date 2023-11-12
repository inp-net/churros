<script lang="ts" context="module">
  export const DESKTOP_NAVIGATION_TABS = [
    'home',
    'groups',
    'events',
    'documents',
    'reports',
    'services',
    'signups',
    'announcements',
    'backrooms',
  ] as const;

  export const MOBILE_NAVIGATION_TABS = ['home', 'groups', 'events', 'services'] as const;
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import TopBar from '$lib/components/NavigationTop.svelte';
  import { theme } from '$lib/theme.js';
  import { onMount } from 'svelte';
  import '../design/app.scss';
  import NavigationBottom from '$lib/components/NavigationBottom.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import IconLoading from '~icons/mdi/loading';
  import IconClose from '~icons/mdi/close';
  import { browser } from '$app/environment';
  import { zeus } from '$lib/zeus';
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import { me } from '$lib/session';
  import { toasts } from '$lib/toasts';
  import Toast from '$lib/components/Toast.svelte';
  import type { PageData, Snapshot } from './$types';
  import NavigationSide from '$lib/components/NavigationSide.svelte';
  import OverlayQuickBookings from '$lib/components/OverlayQuickBookings.svelte';
  import { writable, type Writable } from 'svelte/store';
  import { syncToLocalStorage } from 'svelte-store2storage';

  function currentTabDesktop(url: URL): (typeof DESKTOP_NAVIGATION_TABS)[number] {
    const starts = (segment: string) => url.pathname.startsWith(segment);

    if (starts('/groups')) return 'groups';
    if (starts('/week') || starts('/bookings') || starts('/events')) return 'events';
    if (starts('/services')) return 'services';
    if (starts('/documents')) return 'documents';
    if (starts('/signups')) return 'signups';
    if (starts('/backrooms') || starts('/logs')) return 'backrooms';
    if (starts('/reports')) return 'reports';
    if (starts('/announcements')) return 'announcements';
    return 'home';
  }

  function currentTabMobile(url: URL): (typeof MOBILE_NAVIGATION_TABS)[number] {
    const tab = currentTabDesktop(url);
    for (const mobileTab of MOBILE_NAVIGATION_TABS) if (mobileTab === tab) return tab;

    return 'services';
  }

  export let data: PageData;
  let showInitialSpinner = true;
  let scrollableArea: HTMLElement;

  /**
   * Stores scrollTop of scrollableArea per URL
   */
  const scrollPositions: Writable<Record<string, number>> = writable({});
  if (browser) syncToLocalStorage(scrollPositions, 'scroll_positions');

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

    const scrollableArea = document.querySelector('#scrollable-area');
    scrollableArea!.addEventListener('scroll', () => {
      scrolled = scrollableArea!.scrollTop >= 3;
    });

    setInterval(() => {
      now = new Date();
    }, 5000);
  });

  let announcements = [] as Array<{
    title: string;
    bodyHtml: string;
    warning: boolean;
    id: string;
  }>;

  let now = new Date();
  let scrolled = false;

  type NProgress = {
    start: () => void;
    done: () => void;
    remove: () => void;
  };

  beforeNavigate(() => {
    (window as unknown as Window & { NProgress: NProgress }).NProgress.start();
    $scrollPositions[$page.url.pathname] = scrollableArea.scrollTop;
  });

  afterNavigate(async () => {
    const { NProgress } = window as unknown as Window & { NProgress: NProgress };

    NProgress.done();
    setTimeout(() => {
      NProgress.remove();
    }, 1000);

    scrollableArea.scrollTo(0, $scrollPositions[$page.url.pathname] ?? 0);

    const { announcementsNow } = await $zeus.query({
      announcementsNow: [
        { now: new Date() },
        {
          title: true,
          bodyHtml: true,
          warning: true,
          id: true,
        },
      ],
    });
    announcements = announcementsNow;
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

  export const snapshot: Snapshot<number> = {
    capture: () => scrollableArea.scrollTop,
    restore(y) {
      scrollableArea.scrollTo(0, y);
    },
  };

  function pageIsFullsize(url: URL) {
    const fragments = url.pathname.split('/');
    return fragments[1] === 'club' && fragments[3] === 'event';
  }

  function announcementHiddenByUser(id: string): boolean {
    if (!browser) return true;
    return Boolean(window.localStorage.getItem(`hideAnnouncement${id}`));
  }

  $: scanningTickets = $page.url.pathname.endsWith('/scan/');
  $: showingTicket = /\/bookings\/\w+\/$/.exec($page.url.pathname);
</script>

<svelte:head>
  <title>AEn7</title>
</svelte:head>

<div id="loading-overlay" class:visible={showInitialSpinner}>
  <img src="/splash-screen.png" alt="AEn7" />
  <div class="spinner">
    <IconLoading />
  </div>
  <p class="typo-details">Connexion en cours…</p>
</div>

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

<OverlayQuickBookings {now} registrationsOfUser={data.registrationsOfUser}></OverlayQuickBookings>

<div class="layout">
  <TopBar {scrolled} />

  <div class="page-and-sidenav">
    <NavigationSide current={currentTabDesktop($page.url)} />
    <div
      id="scrollable-area"
      class="contents-and-announcements"
      class:fullsize={pageIsFullsize($page.url)}
      bind:this={scrollableArea}
    >
      <section class="announcements fullsize">
        {#if !scanningTickets && !showingTicket}
          {#each announcements.filter(({ id }) => !announcementHiddenByUser(id)) as { title, bodyHtml, warning, id } (id)}
            <article class="announcement {warning ? 'warning' : 'primary'}">
              <div class="text">
                <strong>{title}</strong>
                <div class="body">
                  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                  {@html bodyHtml}
                </div>
              </div>
              <ButtonGhost
                on:click={() => {
                  window.localStorage.setItem(`hideAnnouncement${id}`, 'true');
                  announcements = announcements.filter((a) => a.id !== id);
                }}><IconClose /></ButtonGhost
              >
            </article>
          {/each}
        {/if}
      </section>
      <main>
        <slot />
      </main>
    </div>
  </div>

  <NavigationBottom current={currentTabMobile($page.url)} />
</div>

<style lang="scss">
  /*

The root layout is composed of several elements:

- atop everything, positionned absolutely:
  - the loading overlay
  - toasts
  - quick bookings

- the top navbar
- horizontally:
  - the side navbar (desktop only)
  - vertically (this is the content that scrolls):
    - the announcements
    - the page content
- the bottom navbar (mobile only)


*/

  .layout {
    display: grid;
    grid-template-rows: max-content 1fr max-content;
    width: 100dvw;
    height: 100dvh;
  }

  .page-and-sidenav {
    display: grid;
    gap: 2rem;
    width: 100%;
    height: 100%;
    min-height: 0;
    @media (width >= 900px) {
      grid-template-columns: max-content 1fr;
    }
  }

  .contents-and-announcements {
    min-height: 0;
    padding-bottom: 2rem;
    overflow-y: scroll;
    scrollbar-width: thin;
  }

  .contents-and-announcements:not(.fullsize) main {
    padding: 0 1rem;
  }

  :global(*::-webkit-scrollbar *) {
    width: 100px;
    background-color: red;
  }

  .announcements {
    display: flex;
    flex-flow: column wrap;
    width: 100%;
  }

  .announcement {
    display: flex;
    column-gap: 1rem;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 2rem;
    color: var(--text);
    background: var(--bg);
  }

  @media (width >= 900px) {
    .announcements {
      padding: 0 1rem;
    }

    .announcement:first-child {
      border-top-left-radius: var(--radius-block);
      border-top-right-radius: var(--radius-block);
    }

    .announcement:last-child {
      border-bottom-right-radius: var(--radius-block);
      border-bottom-left-radius: var(--radius-block);
    }
  }

  .announcement:last-child {
    margin-bottom: 2rem;
  }

  .announcement .text {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    align-items: center;
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
    @media (width >= 1000px) {
      right: 0;
      bottom: 6rem;
      left: unset;
      max-width: 700px;
      padding: 0 2rem 0 0;
      transform: unset;
    }
  }

  @keyframes spinner {
    from {
      transform: rotate(0);
    }

    to {
      transform: rotate(1turn);
    }
  }

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
  }

  #loading-overlay:not(.visible) {
    display: none;
  }

  @media not all and (display-mode: standalone) {
    #loading-overlay {
      display: none;
    }
  }

  :root.error-404 {
    --bg: #000;
    --text: #25bf22;
    --border: #25bf22;
    --primary-link: #54fe54;
  }
</style>
