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
  import { browser } from '$app/environment';
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ModalChangelog from '$lib/components/ModalChangelog.svelte';
  import NavigationBottom from '$lib/components/NavigationBottom.svelte';
  import NavigationSide from '$lib/components/NavigationSide.svelte';
  import TopBar from '$lib/components/NavigationTop.svelte';
  import OverlayQuickBookings from '$lib/components/OverlayQuickBookings.svelte';
  import { subscribe } from '$lib/subscriptions';
  import { theme } from '$lib/theme.js';
  import { onMount } from 'svelte';
  import { syncToLocalStorage } from 'svelte-store2storage';
  import { writable, type Writable } from 'svelte/store';
  import IconClose from '~icons/mdi/close';
  import Snowflake from '~icons/mdi/snowflake';
  import '../../design/app.scss';
  import type { PageData, Snapshot } from './$types';

  export let data: PageData;
  let scrollableArea: HTMLElement;

  let scrolled = false;
  let announcements = [] as Array<{
    title: string;
    bodyHtml: string;
    warning: boolean;
    id: string;
  }>;

  const now = new Date();

  function currentTabDesktop(url: URL): (typeof DESKTOP_NAVIGATION_TABS)[number] {
    const starts = (segment: string) => url.pathname.startsWith(segment);

    if (starts('/groups')) return 'groups';
    if (starts('/week') || starts('/booking') || starts('/events')) return 'events';
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

  function pageIsFullsize(url: URL) {
    const fragments = url.pathname.split('/');
    return fragments[1] === 'club' && fragments[3] === 'event';
  }

  function announcementHiddenByUser(id: string): boolean {
    if (!browser) return true;
    return Boolean(window.localStorage.getItem(`hideAnnouncement${id}`));
  }
  /**
   * Stores scrollTop of scrollableArea per URL
   */
  const scrollPositions: Writable<Record<string, number>> = writable({});
  if (browser) syncToLocalStorage(scrollPositions, 'scroll_positions');

  beforeNavigate(() => {
    $scrollPositions[$page.url.pathname] = scrollableArea.scrollTop;
  });

  afterNavigate(async () => {
    scrollableArea.scrollTo(0, $scrollPositions[$page.url.pathname] ?? 0);
  });
  onMount(() => {
    const scrollableArea = document.querySelector('#scrollable-area');
    scrollableArea!.addEventListener('scroll', () => {
      scrolled = scrollableArea!.scrollTop >= 3;
    });

    $subscribe(
      {
        announcementsNow: {
          id: true,
          title: true,
          bodyHtml: true,
          warning: true,
        },
      },
      async (data) => {
        const freshData = await data;
        if ('errors' in freshData) return;
        announcements = freshData.announcementsNow.filter(Boolean) as Array<{
          title: string;
          bodyHtml: string;
          warning: boolean;
          id: string;
        }>;
      },
    );
  });

  export const snapshot: Snapshot<number> = {
    capture: () => scrollableArea.scrollTop,
    restore(y) {
      scrollableArea.scrollTo(0, y);
    },
  };

  $: scanningTickets = $page.url.pathname.endsWith('/scan/');
  $: showingTicket = /\/bookings\/\w+\/$/.exec($page.url.pathname);
</script>

{#if data.combinedChangelog.length > 0}
  <ModalChangelog
    on:acknowledge={() => {
      data.combinedChangelog = [];
    }}
    open
    log={data.combinedChangelog}
  />
{/if}

<OverlayQuickBookings {now} registrationsOfUser={data.registrationsOfUser}></OverlayQuickBookings>

<div class="layout">
  <TopBar {scrolled} />

  {#if $theme === 'noel'}
    {#each { length: 100 } as _}
      <div class="flake">
        <Snowflake />
      </div>
    {/each}
  {/if}

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
                <div class="body" data-user-html>
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
        {#if $theme == 'pan7on'}
          <div class="pan7div"></div>
        {/if}
        {#if $theme == 'ber7ker'}
          <div class="ber7div"></div>
        {/if}
      </main>
    </div>
  </div>

  <NavigationBottom current={currentTabMobile($page.url)} />
</div>

<style lang="scss">
  @use 'sass:math';

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
  .pan7div {
    // Si cette div existe encore après les semaines de campagnes, moi Benjamin Soyer
    // m'engage à laver les ecocups.
    height: 3rem;
  }

  .ber7div {
    // Si cette div existe encore après les semaines de campagnes, moi Benjamin Soyer
    // je m'engage à trouver quelqu'un de ber7ker.
    height: 6rem;
  }

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

    @media (min-width: 900px) {
      grid-template-columns: max-content 1fr;
    }
  }

  .contents-and-announcements {
    min-height: 0;
    padding-top: 1rem;
    padding-bottom: 2rem;
    overflow-y: scroll;
    scrollbar-width: thin;
  }

  main {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .contents-and-announcements:not(.fullsize) main {
    padding: 0 1rem;
  }

  #scrollable-area {
    display: flex;
    flex-direction: column;
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
    background-image: url('/gd7t-t.jpg');
  }

  @media (min-width: 900px) {
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

  @keyframes spinner {
    from {
      transform: rotate(0);
    }

    to {
      transform: rotate(1turn);
    }
  }

  :root.error-404 {
    --bg: #000;
    --text: #25bf22;
    --border: #25bf22;
    --primary-link: #54fe54;
  }

  @function random-range($min, $max) {
    $rand: math.random();
    $random-range: $min + math.floor($rand * (($max - $min) + 1));

    @return $random-range;
  }

  .flake {
    position: absolute;
    z-index: -10;
    width: 10px;
    height: 10px;
    background: transparent;
    border-radius: 50%;

    $total: 200;

    @for $i from 1 through $total {
      $random-x: random-range(100000, 900000) * 0.0001vw;
      $random-offset: random-range(-100000, 100000) * 0.0001vw;
      $random-x-end: $random-x + $random-offset;
      $random-x-end-yoyo: $random-x + (math.div($random-offset, 2));
      $random-yoyo-time: math.div(random-range(30000, 80000), 100000);
      $random-yoyo-y: $random-yoyo-time * 100vh;
      $random-scale: math.random(15000) * 0.0001;
      $fall-duration: random-range(15, 30) * 1s;
      $fall-delay: math.random(30) * -1s;

      &:nth-child(#{$i}) {
        opacity: math.random(10000) * 0.0001;
        transform: translate($random-x, -10px) scale($random-scale);
        animation: fall-#{$i} $fall-duration $fall-delay linear infinite;
      }

      @keyframes fall-#{$i} {
        #{percentage($random-yoyo-time)} {
          transform: translate($random-x-end, $random-yoyo-y) scale($random-scale);
        }

        100% {
          transform: translate($random-x-end-yoyo, 90vh) scale($random-scale);
        }
      }
    }
  }
</style>
