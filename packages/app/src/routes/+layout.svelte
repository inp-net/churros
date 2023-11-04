<script lang="ts">
  import { page } from '$app/stores';
  import { swipe } from 'svelte-gestures';
  import TopBar from '$lib/components/NavigationTop.svelte';
  import { syncToLocalStorage } from 'svelte-store2storage';
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
  import ModalReportIssue from '$lib/components/ModalReportIssue.svelte';
  import { toasts } from '$lib/toasts';
  import Toast from '$lib/components/Toast.svelte';
  import CardTicket from '$lib/components/CardTicket.svelte';
  import type { PageData } from './$types';
  import {
    differenceInHours,
    differenceInMinutes,
    formatDistanceToNow,
    isBefore,
    isFuture,
  } from 'date-fns';
  import fr from 'date-fns/locale/fr/index.js';
  import { slide } from 'svelte/transition';
  import { writable } from 'svelte/store';

  function currentTab(url: URL): 'events' | 'groups' | 'services' | 'home' {
    const starts = (segment: string) => url.pathname.startsWith(segment);

    if (starts('/groups')) return 'groups';
    if (starts('/week') || starts('/bookings') || starts('/events')) return 'events';
    if (starts('/services')) return 'services';
    return 'home';
  }

  export let data: PageData;
  let showInitialSpinner = true;

  const hiddenQuickBookings = writable([] as string[]);
  if (browser) syncToLocalStorage(hiddenQuickBookings, 'hidden_quick_bookings');

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

  type NProgress = {
    start: () => void;
    done: () => void;
    remove: () => void;
  };

  beforeNavigate(() => {
    (window as unknown as Window & { NProgress: NProgress }).NProgress.start();
  });

  afterNavigate(async () => {
    const { NProgress } = window as unknown as Window & { NProgress: NProgress };

    NProgress.done();
    setTimeout(() => {
      NProgress.remove();
    }, 1000);

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

  function pageIsFullsize() {
    const fragments = $page.url.pathname.split('/');
    return fragments[1] === 'club' && fragments[3] === 'event';
  }

  function announcementHiddenByUser(id: string): boolean {
    if (!browser) return true;
    return Boolean(window.localStorage.getItem(`hideAnnouncement${id}`));
  }

  $: scanningTickets = $page.url.pathname.endsWith('/scan/');
  $: showingTicket = /\/bookings\/\w+\/$/.exec($page.url.pathname);

  let reportIssueDialogElement: HTMLDialogElement;

  // See https://github.com/Rezi/svelte-gestures/pull/21
  const quickBookingTouchAction = 'pan-y pinch-zoom' as unknown as 'pan-y';
</script>

<ModalReportIssue bind:element={reportIssueDialogElement} />

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

<div class="page">
  <TopBar
    on:report-issue={() => {
      reportIssueDialogElement.showModal();
    }}
  />

  <div class="layout">
    {#if announcements.length > 0 && !scanningTickets && !showingTicket}
      <section class="announcements fullsize">
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
      </section>
    {/if}

    <NavigationBottom current={currentTab($page.url)} />

    {#if data.registrationsOfUser?.edges.length > 0 && !$page.url.pathname.startsWith('/bookings')}
      {@const registration = data.registrationsOfUser.edges[0].node}
      <!-- If the quick booking is not hidden and:
      - it starts in less than 30 mins; or
      - it ongoing; or 
      - was finished less than 2 hours ago -->
      {#if !$hiddenQuickBookings.includes(registration.id) && (differenceInMinutes(registration.ticket.event.startsAt, now) <= 30 || isBefore(now, registration.ticket.event.endsAt) || differenceInHours(now, registration.ticket.event.endsAt) <= 2)}
        <section
          in:slide={{ axis: 'y', duration: 100 }}
          use:swipe={{ touchAction: quickBookingTouchAction }}
          on:swipemove={(event) => {
            const {
              target,
              detail: {
                event: { movementY, movementX },
              },
            } = event;
            if (!target || !(target instanceof HTMLElement)) return;
            if (Math.abs(Math.abs(movementX) - Math.abs(movementY)) < 10) return;

            if (Math.abs(movementX) < 10) return;

            target.style.transform = `translateX(${movementX > 0 ? '+' : '-'}100vw)`;
            setTimeout(() => {
              $hiddenQuickBookings = [...$hiddenQuickBookings, registration.id];
            }, 500);
          }}
          class="quick-booking"
        >
          <p class="hint">
            <strong>
              C'est {#if isFuture(registration.ticket.event.startsAt)}
                dans {formatDistanceToNow(registration.ticket.event.startsAt, {
                  locale: fr,
                }).replace('environ ', '')}{:else}maintenant{/if}! Voici ta place
            </strong>
            <span class="dismiss">
              <ButtonGhost
                on:click={() => {
                  $hiddenQuickBookings = [...$hiddenQuickBookings, registration.id];
                }}
              >
                <IconClose></IconClose>
              </ButtonGhost>
            </span>
          </p>
          <CardTicket floating href="/bookings/{registration.code}" {...registration}></CardTicket>
        </section>
      {/if}
    {/if}

    <main class:fullsize={pageIsFullsize()}>
      <slot />
    </main>
  </div>
</div>

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
  }

  #loading-overlay:not(.visible) {
    display: none;
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

  .page {
    min-height: 100vh;
  }

  .layout {
    // max-width: 100rem;
    padding-top: 5rem; // XXX equal to topbar's height
    padding-bottom: 5rem; /// XXX equal to navbar's height
    margin: auto;

    > *:not(.fullsize) {
      padding: 0 0.5rem;
    }
  }

  .layout,
  main {
    height: 100%;
  }

  .announcements {
    display: flex;
    flex-flow: column wrap;
    width: 100%;
    margin-bottom: 2rem;
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

  .announcement .text {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    align-items: center;
  }

  .quick-booking {
    position: fixed;
    right: 0;
    bottom: 4.5rem;
    left: 0;
    z-index: 20;
    width: 100%;
    transition: all 0.25s ease;
    transform: translateX(0);

    @media (width>=600px) {
      right: 1rem;
      left: unset;
      max-width: 400px;
    }

    .hint {
      display: flex;
      flex-wrap: wrap;
      column-gap: 0.5rem;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem;
      text-align: center;

      // fade from transparent to var(--bg)
      background: linear-gradient(to bottom, transparent 0%, var(--bg) 60%);
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

  @media not all and (display-mode: standalone) {
    #loading-overlay {
      display: none;
    }
  }
</style>
