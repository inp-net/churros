<script lang="ts" context="module">
  export const AppLayoutScanningEvent = new AppLayoutScanningEventStore();
</script>

<script lang="ts">
  import { browser } from '$app/environment';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { AppLayoutScanningEventStore, graphql } from '$houdini';
  import { CURRENT_VERSION } from '$lib/buildinfo';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ModalChangelog from '$lib/components/ModalChangelog.svelte';
  import ModalCreateGroup from '$lib/components/ModalCreateGroup.svelte';
  import NavigationBottom from '$lib/components/NavigationBottom.svelte';
  import NavigationSide from '$lib/components/NavigationSide.svelte';
  import OverlayQuickBookings from '$lib/components/OverlayQuickBookings.svelte';
  import QuickAccessList from '$lib/components/QuickAccessList.svelte';
  import { allLoaded } from '$lib/loading';
  import { scanningEventsRouteID } from '$lib/navigation';
  import { setupScrollPositionRestorer } from '$lib/scroll';
  import { currentTabMobile } from '$lib/tabs';
  import { isDark } from '$lib/theme';
  import { setContext } from 'svelte';
  import { syncToLocalStorage } from 'svelte-store2storage';
  import { writable } from 'svelte/store';
  import IconClose from '~icons/mdi/close';
  import '../../design/app.scss';
  import type { PageData } from './$houdini';
  import type { Snapshot } from './$types';
  import NavigationTop, { type NavigationContext } from './NavigationTop.svelte';

  export let data: PageData;
  $: ({ AppLayout } = data);

  afterNavigate(async ({ to }) => {
    if (!browser) return;
    if (!to) return;
    if (to.route.id === scanningEventsRouteID)
      await AppLayoutScanningEvent.fetch({ variables: { id: $page.params.id! } });
  });

  export const snapshot: Snapshot<number> = {
    capture: () => scrollableArea.scrollTop,
    restore(y) {
      scrollableArea.scrollTo(0, y);
    },
  };

  let scrollableArea: HTMLElement;
  let scrolled = false;
  $: if (scrollableArea) {
    setupScrollPositionRestorer(scrollableArea, (isScrolled) => {
      scrolled = isScrolled;
    });
  }

  const now = new Date();

  function pageIsFullsize(url: URL) {
    const fragments = url.pathname.split('/');
    return fragments[1] === 'club' && fragments[3] === 'event';
  }

  function announcementHiddenByUser(id: string, hiddenAnnouncements: string[]): boolean {
    return !browser || hiddenAnnouncements.includes(id);
  }
  const hiddenAnnouncements = writable<string[]>([]);
  if (browser) syncToLocalStorage(hiddenAnnouncements, 'hidden_announcements');

  const announcements = graphql(`
    subscription AnnoncementUpdates {
      announcementsNow {
        id
        title
        bodyHtml
        warning
      }
    }
  `);
  $: announcements.listen();

  $: scanningTickets = $page.url.pathname.endsWith('/scan/');
  $: showingTicket = /\/bookings\/\w+\/$/.exec($page.url.pathname);

  // Select which student association to create groups linked to.
  // We get all the student associations the logged-in user can create groups on,
  // and we get the one which has the most groups existing
  $: creatingGroupLinkedTo =
    $AppLayout.data?.me?.major?.schools
      .filter((s) => allLoaded(s))
      .flatMap((s) => s.studentAssociations)
      .filter((ae) => ae.canCreateGroups)
      .sort((a, b) => a.groupsCount - b.groupsCount)
      .toReversed()
      .at(0)?.uid ?? null;

  let changelogAcknowledged = false;

  let newGroupDialog: HTMLDialogElement;

  const navtop = writable<NavigationContext>({
    actions: [],
    title: null,
    quickAction: null,
    back: null,
  });
  setContext('navtop', navtop);
</script>

{#if !changelogAcknowledged && $AppLayout.data?.combinedChangelog}
  <ModalChangelog
    on:acknowledge={() => {
      changelogAcknowledged = true;
    }}
    open
    log={$AppLayout.data?.combinedChangelog}
  />
{/if}

<ModalCreateGroup studentAssociation={creatingGroupLinkedTo} bind:element={newGroupDialog}
></ModalCreateGroup>

{#if $AppLayout.data?.me?.bookings}
  <OverlayQuickBookings {now} bookings={$AppLayout.data.me.bookings}></OverlayQuickBookings>
{/if}

<div class="layout">
  <NavigationSide user={$AppLayout.data?.me ?? null} />

  <div class="mobile-area">
    <NavigationTop {scrolled}></NavigationTop>
    <div
      id="scrollable-area"
      class="contents-and-announcements"
      class:fullsize={pageIsFullsize($page.url)}
      bind:this={scrollableArea}
    >
      <section class="announcements fullsize">
        {#if !scanningTickets && !showingTicket && $announcements.data?.announcementsNow}
          {#each $announcements.data?.announcementsNow.filter(({ id }) => !announcementHiddenByUser(id, $hiddenAnnouncements)) as { title, bodyHtml, warning, id } (id)}
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
                  $hiddenAnnouncements = [...$hiddenAnnouncements, id];
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
    <NavigationBottom current={currentTabMobile($page.url)} />
  </div>

  <div class="right">
    {#if $AppLayout.data?.me}
      <section class="quick-access">
        <QuickAccessList pins={$AppLayout.data.me} />
      </section>
    {:else}
      <section class="login">
        <h2>Connexion</h2>
        <p>Pour accéder à vos événements, groupes et réservations, connectes-toi.</p>
        <section class="actions">
          <ButtonSecondary href="/login">Connexion</ButtonSecondary>
          <ButtonSecondary href="/register">Inscription</ButtonSecondary>
        </section>
      </section>
    {/if}
    <footer class="muted">
      <p>
        Churros v{CURRENT_VERSION}
        · <wbr />Made by <a href="https://net7.dev">net7</a>
        · <wbr /><a href="/credits">À propos</a>
        · <wbr /><a href="https://git.inpt.fr/inp-net/churros">Code source</a>
        · <wbr /><a href="https://www.gnu.org/licenses/agpl-3.0.en.html#license-text"
          >Licensed under AGPL-v3.0</a
        >
        · <wbr />&copy;&nbsp;{new Date().getFullYear()}&nbsp;<a href="https://churros.app/@devs"
          >Churros DevTeam</a
        >
      </p>
      <a href="https://net7.dev" class="net7-logo">
        <img
          height="50px"
          width="100px"
          src="https://net7.dev/images/net7_{$isDark ? 'white' : 'dark'}.svg"
          alt="net7"
        />
      </a>
    </footer>
  </div>
</div>

<style lang="scss">
  @use 'sass:math';

  .layout {
    display: grid;
    grid-template-columns: 1fr minmax(300px, 700px) 1fr;
    gap: 2rem;
    width: 100dvw;
    height: 100dvh;
  }

  @media (max-width: 900px) {
    .layout {
      grid-template-columns: 1fr;
    }

    .layout :global(> *:not(.mobile-area)) {
      display: none;
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

  .layout .right {
    max-width: 300px;
    padding-top: 100px;
  }

  .login .actions {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.5em;
  }

  footer {
    margin-top: 4rem;
  }

  footer p {
    margin-bottom: 2rem;
    font-size: 0.8rem;
  }

  footer p a {
    color: var(--text);
    text-decoration: underline;
    text-decoration-thickness: unset;
    text-underline-offset: unset;
  }

  footer .net7-logo {
    opacity: 0.5;
  }

  footer .net7-logo:hover {
    opacity: 1;
  }

  .mobile-area {
    display: grid;
    grid-template-rows: 5rem auto;
    height: 100svh;
  }

  #scrollable-area {
    display: flex;
    flex-direction: column;

    // height: 0;
    // min-height: calc(100% - 5rem);
  }

  @media (min-width: 900px) {
    #scrollable-area {
      padding: 1rem;
      border-radius: 20px 20px 0 0;
      box-shadow: var(--shadow-big);
    }
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
</style>
