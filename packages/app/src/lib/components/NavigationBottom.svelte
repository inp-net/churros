<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import { scrollToTop } from '$lib/scroll';
  import { me } from '$lib/session';
  import type { MOBILE_NAVIGATION_TABS } from '$lib/tabs';
  import { theme } from '$lib/theme';
  import { tooltip } from '$lib/tooltip';
  import IconPeople from '~icons/mdi/account-add-outline';
  import IconGroup from '~icons/mdi/account-group';
  import IconGroupOutline from '~icons/mdi/account-group-outline';
  import IconBarWeek from '~icons/mdi/beer-outline';
  import IconAnnouncement from '~icons/mdi/bullhorn-outline';
  import IconCalendar from '~icons/mdi/calendar';
  import IconCalendarOutline from '~icons/mdi/calendar-blank-outline';
  import IconEvent from '~icons/mdi/calendar-plus';
  import IconDotsCircle from '~icons/mdi/dots-horizontal-circle';
  import IconDotsCircleOutline from '~icons/mdi/dots-horizontal-circle-outline';
  import IconForms from '~icons/mdi/format-list-bulleted';
  import IconHome from '~icons/mdi/home';
  import IconHomeOutline from '~icons/mdi/home-outline';
  import IconArticle from '~icons/mdi/newspaper';
  import IconAddCircle from '~icons/mdi/plus-circle';
  import IconAddCircleOutline from '~icons/mdi/plus-circle-outline';
  import LogoFrappe from './LogoFrappe.svelte';

  export let current: (typeof MOBILE_NAVIGATION_TABS)[number];
  export let openNewGroupModal: () => void;
  let flyoutOpen = false;

  beforeNavigate(() => {
    flyoutOpen = false;
  });
</script>

{#if $theme === 'pan7on' && !$page.url.pathname.endsWith('/scan/')}
  <img src="/ChurrosPan7onTelBas.png" alt="ChurrosPcPan7on" class="temple" />
{/if}
{#if $theme === 'ber7ker' && !$page.url.pathname.endsWith('/scan/')}
  <img src="/dessinBer7ker.png" alt="illustrationBer7ker" class="ber7kersboat" />
  <img src="/LogoBer7kerReverse.png" alt="illustrationBer7ker" class="ber7kersboatpc" />
{/if}
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
        <IconHome style="color:var(--nav-text)" />
      {:else}
        <IconHomeOutline style="color:var(--nav-text)" />
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
        <IconGroup style="color:var(--nav-text)" />
      {:else}
        <IconGroupOutline style="color:var(--nav-text)" />
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
      <IconAddCircle style="color:var(--nav-text)" />
    {:else}
      <IconAddCircleOutline style="color:var(--nav-text)" />
    {/if}
  </button>

  <a
    href="/events/planning/"
    class:current={!flyoutOpen && current === 'events'}
    class:disabled={flyoutOpen}
    use:tooltip={'Événements'}
  >
    {#if current === 'events'}
      <IconCalendar style="color:var(--nav-text)" />
    {:else}
      <IconCalendarOutline style="color:var(--nav-text)" />
    {/if}
  </a>

  <a
    href="/services/"
    class:current={!flyoutOpen && current === 'services'}
    class:disabled={flyoutOpen}
    use:tooltip={'Les autres services'}
  >
    {#if current === 'services'}
      <IconDotsCircle style="color:var(--nav-text)" />
    {:else}
      <IconDotsCircleOutline style="color:var(--nav-text)" />
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

    {#if $me?.admin || $me?.canEditGroups || $me?.studentAssociationAdmin}
      <ButtonGhost on:click={openNewGroupModal}>
        <IconGroupOutline />
        <span>Groupe</span>
      </ButtonGhost>
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

    <a href="/forms/create">
      <IconForms></IconForms>
      <span>Formulaire</span>
    </a>

    {#if $me?.admin || $me?.studentAssociationAdmin}
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
    background: var(--nav-bottom-background, var(--bg));
    background-repeat: repeat-x;
    background-size: auto 100%;
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

  @media (min-width: 570px) {
    .temple {
      display: none;
    }
  }

  .temple {
    position: fixed;
    bottom: 55px;
    z-index: 100;
    color: transparent;
    pointer-events: none;
    background: none;
    background-color: transparent;
  }

  .ber7kersboat {
    position: fixed;
    bottom: 23px;
    left: -38px;
    z-index: 1;
    width: 13rem;
    color: transparent;
    pointer-events: none;
    background: none;
    background-color: transparent;

    @media (min-width: 570px) {
      display: none;
    }
  }

  .ber7kersboatpc {
    position: fixed;
    right: -2rem;
    bottom: -3rem;
    z-index: 1;
    width: 20rem;
    color: transparent;
    pointer-events: none;
    background: none;
    background-color: transparent;

    @media (max-width: 570px) {
      display: none;
    }
  }
</style>
