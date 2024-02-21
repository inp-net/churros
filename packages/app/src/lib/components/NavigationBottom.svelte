<script lang="ts">
  import IconHomeOutline from '~icons/mdi/home-outline';
  import IconPeople from '~icons/mdi/account-add-outline';
  import IconHome from '~icons/mdi/home';
  import IconAddCircleOutline from '~icons/mdi/plus-circle-outline';
  import IconAddCircle from '~icons/mdi/plus-circle';
  import IconCalendarOutline from '~icons/mdi/calendar-blank-outline';
  import IconCalendar from '~icons/mdi/calendar';
  import IconDotsCircleOutline from '~icons/mdi/dots-horizontal-circle-outline';
  import IconDotsCircle from '~icons/mdi/dots-horizontal-circle';
  import IconGroup from '~icons/mdi/account-group';
  import IconGroupOutline from '~icons/mdi/account-group-outline';

  import IconBarWeek from '~icons/mdi/beer-outline';
  import IconAnnouncement from '~icons/mdi/bullhorn-outline';
  import IconArticle from '~icons/mdi/newspaper';
  import IconEvent from '~icons/mdi/calendar-plus';
  import { beforeNavigate } from '$app/navigation';
  import { me } from '$lib/session';
  import { page } from '$app/stores';
  import { tooltip } from '$lib/tooltip';
  import type { MOBILE_NAVIGATION_TABS } from '../../routes/(app)/+layout.svelte';
  import { scrollToTop } from '$lib/scroll';
  import { theme } from '$lib/theme';
  import LogoFrappe from './LogoFrappe.svelte';

  export let current: (typeof MOBILE_NAVIGATION_TABS)[number];
  let flyoutOpen = false;

  beforeNavigate(() => {
    flyoutOpen = false;
  });
</script>

<nav
  class:flyout-open={flyoutOpen}
  class:transparent={$page.url.pathname.endsWith('/scan/') && !flyoutOpen}
  class={$theme}
>
  {#if $page.url.pathname === '/'}
    <button class="current" class:disabled={flyoutOpen} on:click={scrollToTop}>
      <IconHome />
    </button>
  {:else}
    <a
      href="/"
      class:current={!flyoutOpen && current === 'home'}
      class:disabled={flyoutOpen}
      use:tooltip={'Mon feed'}
    >
      {#if current === 'home'}
        <IconHome />
      {:else}
        <IconHomeOutline />
      {/if}
    </a>
  {/if}

  {#if $page.url.pathname === '/groups/'}
    <button class="current" class:disabled={flyoutOpen} on:click={scrollToTop}>
      <IconGroup></IconGroup>
    </button>
  {:else}
    <a
      href="/groups"
      class:current={!flyoutOpen && current === 'groups'}
      class:disabled={flyoutOpen}
      use:tooltip={'Clubs'}
    >
      {#if current === 'groups'}
        <IconGroup />
      {:else}
        <IconGroupOutline />
      {/if}
    </a>
  {/if}

  <button
    class:current={flyoutOpen}
    on:click={() => {
      flyoutOpen = !flyoutOpen;
    }}
    use:tooltip={'Créer…'}
  >
    {#if flyoutOpen}
      <IconAddCircle />
    {:else}
      <IconAddCircleOutline />
    {/if}
  </button>

  <a
    href="/events/planning/"
    class:current={!flyoutOpen && current === 'events'}
    class:disabled={flyoutOpen}
    use:tooltip={'Événements'}
  >
    {#if current === 'events'}
      <IconCalendar />
    {:else}
      <IconCalendarOutline />
    {/if}
  </a>

  <a
    href="/services/"
    class:current={!flyoutOpen && current === 'services'}
    class:disabled={flyoutOpen}
    use:tooltip={'Les autres services'}
  >
    {#if current === 'services'}
      <IconDotsCircle />
    {:else}
      <IconDotsCircleOutline />
    {/if}
  </a>
</nav>

<svelte:window
  on:keydown={(e) => {
    if (!(e instanceof KeyboardEvent)) return;
    if (!flyoutOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      flyoutOpen = false;
    }
  }}
/>

<!-- eslint-disable-next-line svelte/a11y-click-events-have-key-events handled by svelte:window above -->
<!-- eslint-disable-next-line svelte/a11y-no-noninteractive-element-interactions -->
<div
  class="flyout-backdrop"
  on:click={() => {
    flyoutOpen = false;
  }}
  class:open={flyoutOpen}
  role="presentation"
>
  <section class="flyout" class:open={flyoutOpen}>
    {#if $me?.admin}
      <a href="/bar-weeks">
        <IconBarWeek />
        <span>Semaine de bar</span>
      </a>
    {/if}

    {#if $me?.admin || $me?.canEditGroups}
      <a href="/groups/create">
        <IconGroupOutline />
        <span>Groupe</span>
      </a>
    {/if}

    {#if $me?.admin}
      <a href="/announcements">
        <IconAnnouncement />
        <span>Annonces</span>
      </a>
    {/if}

    <a href="/documents/create">
      <LogoFrappe />
      <span>Frappe</span>
    </a>

    <a href="/posts/create">
      <IconArticle />
      <span>Post</span>
    </a>

    <a href="/events/create">
      <IconEvent />
      <span>Événement</span>
    </a>

    {#if $me?.admin || $me?.canEditUsers}
      <a href="/signups">
        <IconPeople />
        <span>Inscriptions</span>
      </a>
    {/if}
  </section>
</div>

<style>
  nav {
    z-index: 101;
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-evenly;
    width: 100%;
    height: 4rem;
    background: var(--bg);
    border-top: var(--border-block) solid rgb(0 0 0 / 5%);
  }

  nav.noel {
    background-color: var(--bg);
    background-image: url('/noel-bottombar.png');
    background-size: cover;
    border-top: none;
  }

  nav.gd7t {
    background-color: transparent;
    background-image: url('/gd7t-bottom.png');
    background-position: center;
    background-size: 100% 100%;
    backdrop-filter: blur(10px);
    border-top: none;
  }

  nav.transparent {
    color: white;
    background: transparent;

    --text: white;
  }

  nav.flyout-open {
    border-top-color: var(--bg);
  }

  button {
    padding: 0;
    margin: 0;
    color: var(--text);
    cursor: pointer;
    background: transparent;
    border: none;
  }

  a,
  button {
    font-size: 1.25rem;
    transition: color 0.25s ease;
  }

  .disabled {
    color: var(--muted-text);
  }

  .current {
    color: var(--primary-link);
  }

  .flyout-backdrop.open {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgb(0 0 0 / 50%);
    animation: fade-in-backdrop 0.2s ease-in-out;
  }

  @keyframes fade-in-backdrop {
    from {
      background: rgb(0 0 0 / 0%);
    }

    to {
      background: rgb(0 0 0 / 50%);
    }
  }

  .flyout {
    position: fixed;
    right: 0;
    bottom: 3rem;
    left: 0;
    z-index: 30;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-evenly;
    max-height: 75vh;
    padding: 1rem;
    background: var(--bg);
    border-top: var(--border-block) solid rgb(0 0 0 / 5%);
    border-top-left-radius: calc(4 * var(--radius-block));
    border-top-right-radius: calc(4 * var(--radius-block));
    transition: bottom 0.2s ease-in-out;
  }

  .flyout:not(.open) {
    bottom: -100%;
  }

  .flyout a {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: calc(min(max(5rem, 33%), 10rem));
    aspect-ratio: 1;
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
  }

  .flyout a span {
    margin-top: 0.2rem;
    font-size: 0.8rem;
  }

  @media (min-width: 900px) {
    nav {
      display: none;
    }
  }
</style>
