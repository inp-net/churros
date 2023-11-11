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
  import IconDocument from '~icons/mdi/file-outline';
  import IconArticle from '~icons/mdi/newspaper';
  import IconEvent from '~icons/mdi/calendar-plus';
  import IconDocumentFilled from '~icons/mdi/file';
  import { beforeNavigate } from '$app/navigation';
  import { me } from '$lib/session';
  import { page } from '$app/stores';

  export let current: 'home' | 'groups' | 'events' | 'services' | 'documents';
  let flyoutOpen = false;

  beforeNavigate(() => {
    flyoutOpen = false;
  });
</script>

<nav
  class="navigation-side"
  class:flyout-open={flyoutOpen}
  class:transparent={$page.url.pathname.endsWith('/scan/') && !flyoutOpen}
>
  <a
    class="navigation-item"
    href="/"
    class:current={!flyoutOpen && current === 'home'}
    class:disabled={flyoutOpen}
  >
    {#if current === 'home'}
      <IconHome />
    {:else}
      <IconHomeOutline />
    {/if}
    Mon feed
  </a>

  <a
    class="navigation-item"
    href="/groups"
    class:current={!flyoutOpen && current === 'groups'}
    class:disabled={flyoutOpen}
  >
    {#if current === 'groups'}
      <IconGroup />
    {:else}
      <IconGroupOutline />
    {/if}
    Clubs
  </a>

  <button
    class="navigation-item"
    class:current={flyoutOpen}
    on:click={() => {
      flyoutOpen = !flyoutOpen;
    }}
  >
    {#if flyoutOpen}
      <IconAddCircle />
    {:else}
      <IconAddCircleOutline />
    {/if}
    Créer…
  </button>

  <a
    class="navigation-item"
    href="/events/planning/"
    class:current={!flyoutOpen && current === 'events'}
    class:disabled={flyoutOpen}
  >
    {#if current === 'events'}
      <IconCalendar />
    {:else}
      <IconCalendarOutline />
    {/if}
    Événements
  </a>

  <a class="navigation-item" href="/frappe" class:current={!flyoutOpen && current === 'documents'}>
    {#if current === 'documents'}
      <IconDocumentFilled />
    {:else}
      <IconDocument />
    {/if}
    La Frappe
  </a>

  <a
    class="navigation-item"
    href="/services/"
    class:current={!flyoutOpen && current === 'services'}
    class:disabled={flyoutOpen}
  >
    {#if current === 'services'}
      <IconDotsCircle />
    {:else}
      <IconDotsCircleOutline />
    {/if}
    Les autre services
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
      <IconDocument />
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
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem;
    background: var(--bg);
    border-top: var(--border-block) solid rgb(0 0 0 / 5%);
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

  .navigation-item {
    display: flex;
    gap: 0.5em;
    align-items: center;
    padding: 0.5rem 0.75rem;
    font-size: 1.25rem;
    text-align: left;
    border-radius: var(--radius-block);
    transition: color 0.25s ease;
  }

  .navigation-item:hover,
  .navigation-item:focus-visible {
    background-color: var(--hover-bg);
  }

  .navigation-item :global(> svg) {
    height: 1.2em;
  }

  .disabled {
    color: var(--muted-text);
  }

  .current {
    color: var(--primary-link);
    background-color: color-mix(in srgb, var(--primary-link) 25%, transparent);
  }

  .flyout-backdrop:not(.open) {
    display: none;
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
    top: 130px; /* XXX: where create button is... */
    right: 0;
    left: 5rem;
    z-index: 30;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-evenly;
    max-width: 30rem;
    padding: 1rem;
    background: var(--bg);
    border-top: var(--border-block) solid rgb(0 0 0 / 5%);
    border-radius: calc(4 * var(--radius-block));
    opacity: 1;
    transition: all 0.3s ease-in-out;
  }

  .flyout:not(.open) {
    left: -40rem;
    opacity: 0;
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

  @media (width <= 899px) {
    nav {
      display: none;
    }
  }
</style>
