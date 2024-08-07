<script lang="ts" context="module">
  export const AppLayoutScanningEvent = new AppLayoutScanningEventStore();
</script>

<script lang="ts">
  import { browser } from '$app/environment';
  import { afterNavigate, onNavigate } from '$app/navigation';
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
  import { isMobile } from '$lib/mobile';
  import { refroute, scanningEventsRouteID } from '$lib/navigation';
  import { scrollableContainer, setupScrollPositionRestorer } from '$lib/scroll';
  import { isDark } from '$lib/theme';
  import { setupViewTransition } from '$lib/view-transitions';
  import { setContext } from 'svelte';
  import { syncToLocalStorage } from 'svelte-store2storage';
  import { writable } from 'svelte/store';
  import IconClose from '~icons/mdi/close';
  import '../../design/app.scss';
  import type { PageData } from './$houdini';
  import NavigationTop, { type NavigationContext } from './NavigationTop.svelte';

  console.log('intiializing layout');

  onNavigate(setupViewTransition);

  const mobile = isMobile();
  export let data: PageData;
  $: ({ AppLayout, RootLayout } = data);

  afterNavigate(async ({ to }) => {
    if (!browser) return;
    if (!to) return;
    if (to.route.id === scanningEventsRouteID)
      await AppLayoutScanningEvent.fetch({ variables: { id: $page.params.id! } });
  });

  let scrolled = false;
  setupScrollPositionRestorer(
    () => scrollableContainer(mobile),
    (isScrolled) => {
      scrolled = isScrolled;
    },
  );

  const now = new Date();

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

  $: if (browser && $page.route.id) document.body.dataset.route = $page.route.id;
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

<ModalCreateGroup  studentAssociation={creatingGroupLinkedTo} bind:element={newGroupDialog}
></ModalCreateGroup>

{#if $AppLayout.data?.me?.bookings}
  <OverlayQuickBookings {now} bookings={$AppLayout.data.me.bookings}></OverlayQuickBookings>
{/if}

<svelte:body data-route={$page.route.id} />

<div class="layout" id="layout" class:mobile>
  <header class="left">
    <NavigationSide user={$AppLayout.data?.me ?? null} />
  </header>

  <div class="mobile-area">
    <header class="nav-top" class:transparent={scanningTickets}>
      <NavigationTop transparent={scanningTickets} {scrolled}></NavigationTop>
      <div class="cap">
        <div class="corner-left-wrapper corner-wrapper">
          <div class="corner-left"></div>
        </div>
        <div class="middle"></div>
        <div class="corner-right-wrapper corner-wrapper">
          <div class="corner-right"></div>
        </div>
      </div>
    </header>

    <div id="scrollable-area" class="contents-and-announcements">
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
      <div class="page-content">
        <slot />
      </div>
    </div>
    <div class="nav-bottom">
      <NavigationBottom me={$AppLayout.data?.me ?? null} transparent={scanningTickets} />
    </div>
  </div>

  <aside class="right">
    {#if $AppLayout.data?.me}
      <section class="quick-access">
        <QuickAccessList pins={$AppLayout.data.me} />
      </section>
    {:else if !$RootLayout.data?.loggedIn}
      <section class="login">
        <h2>Connexion</h2>
        <p>Pour accéder à vos événements, groupes et réservations, connectes-toi.</p>
        <section class="actions">
          <ButtonSecondary href={refroute('/login')}>Connexion</ButtonSecondary>
          <ButtonSecondary href={refroute('/register')}>Inscription</ButtonSecondary>
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
  </aside>
</div>

<style lang="scss">
  @use 'sass:math';

  /**

  Layout:

  +---------------------------------------------+
  |  sidebar  |      topbar         |   aside   |
  |  sidebar  |      cap            |   aside   |
  |  sidebar  | scrollable area     |   aside   |
  |  sidebar  |      bottombar      |   aside   |
  +---------------------------------------------+

  cap + topbar = nav-top
  nav-top + scrollable area + bottombar : mobile-area
  aside : contains stuff like login form, quick access, footer
          TODO: API kinda like navtop, so allow pages to contribute content here.
  

  - On desktop:

  - The root element is the scrollable area. This allows using the scroll wheel anywhere on the page. In order to have that rounded border on top of the scrollable content while keeping the scroll on the body, we need to have the border-radius'd part as a separate element that doesn't move (has position: sticky): that's "cap" (no 🧢 fr fr).
  - The scrollable-area has padding so that the content doesn't go under the cap's rounded corners on scroll

  - On mobile:

  - sidebar and aside as well as cap are all hidden
  - the mobile-area is a flex element, nav top is not sticky but static, and the element with the scrollbar is scrollable-area: this is so that scaling down the background when opening a drawer does not fuck up the nav bars (if they're position: fixed, they fly out of the element when the [data-vaul-drawer-wrapper] is scaled down). UX-wise this is fine as the mobile-area takes the entire screen width on mobile.
  - the scrollable-area kisses the screen's borders: this is important to have full-width content like posts cards.
  */

  .layout {
    display: grid;
    grid-template-columns: 1fr minmax(300px, var(--scrollable-content-width, 700px)) 1fr;
    gap: 2rem;
    width: 100dvw;

    // TODO animate --scrollable-content-width changes

    --scrollable-area-border-color: var(--bg3);

    // Waiting on https://drafts.csswg.org/css-env-1/ to use variables in media queries
    // --width-mobile: 900px;
  }

  .layout .left {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    align-self: start;
  }

  .layout .right {
    position: sticky;
    top: 0;
    right: 0;
    bottom: 0;
    align-self: start;
    max-width: 300px;
    padding-top: 100px;
  }

  .layout .mobile-area {
    grid-column: 2;
  }

  #scrollable-area {
    display: flex;
    flex-direction: column;
    max-width: var(--scrollable-content-width, 700px);
  }

  .layout .nav-bottom {
    display: none;
  }

  .cap {
    display: flex;
    justify-content: space-between;
    height: 30px;
  }

  .cap .middle {
    flex-grow: 1;
    background: transparent;
    border-top: 1px solid var(--scrollable-area-border-color);
  }

  .cap .corner-wrapper {
    position: relative;
    width: 30px;
    height: 30px;
    background: var(--bg);
  }

  .cap .corner-left,
  .cap .corner-right {
    position: absolute;
    inset: 0;

    // z-index: 11;
  }

  .cap .corner-left {
    border-top: solid 1px var(--scrollable-area-border-color);
    border-left: solid 1px var(--scrollable-area-border-color);
    border-top-left-radius: 30px;
  }

  .cap .corner-right {
    border-top: solid 1px var(--scrollable-area-border-color);
    border-right: solid 1px var(--scrollable-area-border-color);
    border-top-right-radius: 30px;
  }

  .nav-top {
    position: sticky;
    top: 0;
    z-index: 20;
  }

  @media (max-width: 900px) {
    .cap {
      display: none;
    }

    .layout .left {
      display: none;
    }

    .layout .right {
      display: none;
    }

    .mobile-area .nav-top,
    .mobile-area .nav-bottom {
      position: static;
      display: block;
    }

    .mobile-area {
      display: flex;
      flex-direction: column;
      width: 100dvw;
      height: 100dvh;
    }

    .layout {
      display: flex;
    }

    #scrollable-area {
      flex: 1;
      width: 100dvw;
      padding: 1rem 0;
      overflow: auto;
    }
  }

  .page-content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
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

  .login .actions {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.5em;
  }

  @media (min-width: 900px) {
    #scrollable-area {
      height: 100%;
      padding: 30px;
      border-right: solid 1px var(--scrollable-area-border-color);
      border-left: solid 1px var(--scrollable-area-border-color);
    }
  }

  .announcements {
    display: flex;
    flex-flow: column wrap;
    width: 100%;
    view-timeline-name: announcements;
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
    --primary: #54fe54;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }

  @keyframes fade-out {
    to {
      opacity: 0;
    }
  }

  @keyframes slide-from-right {
    from {
      transform: scale(0.95);
    }
  }

  @keyframes slide-to-left {
    to {
      transform: scale(1.05);
    }
  }

  :root::view-transition-old(root) {
    animation:
      90ms ease both fade-out,
      200ms ease both slide-to-left;
  }

  :root::view-transition-new(root) {
    animation:
      110ms ease both fade-in,
      200ms ease both slide-from-right;
  }
</style>
