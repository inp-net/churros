<script lang="ts">
  import IconHomeOutline from '~icons/mdi/home-outline';
  import IconPeople from '~icons/mdi/account-add-outline';
  import IconHome from '~icons/mdi/home';
  import IconSearchOutline from '~icons/mdi/card-search-outline';
  import IconSearch from '~icons/mdi/card-search';
  import IconAddCircleOutline from '~icons/mdi/plus-circle-outline';
  import IconAddCircle from '~icons/mdi/plus-circle';
  import IconCalendarOutline from '~icons/mdi/calendar-blank-outline';
  import IconCalendar from '~icons/mdi/calendar';
  import IconDotsCircleOutline from '~icons/mdi/dots-horizontal-circle-outline';
  import IconDotsCircle from '~icons/mdi/dots-horizontal-circle';

  import IconBarWeek from '~icons/mdi/beer-outline';
  import IconGroup from '~icons/mdi/account-group-outline';
  import IconAnnouncement from '~icons/mdi/bullhorn-outline';
  import IconDocument from '~icons/mdi/file-outline';
  import IconArticle from '~icons/mdi/newspaper';
  import IconEvent from '~icons/mdi/calendar-plus';
  import { beforeNavigate } from '$app/navigation';
  import { format, isMonday, previousMonday } from 'date-fns';
  import { me } from '$lib/session';
  import { page } from '$app/stores';

  export let current: 'home' | 'search' | 'events' | 'more';
  let flyoutOpen = false;

  function closestMonday(date: Date): Date {
    if (isMonday(date)) return date;
    return previousMonday(date);
  }

  beforeNavigate(() => {
    flyoutOpen = false;
  });
</script>

<nav class:flyout-open={flyoutOpen} class:transparent={$page.url.pathname.endsWith('/scan/')}>
  <a href="/" class:current={!flyoutOpen && current === 'home'} class:disabled={flyoutOpen}>
    {#if current === 'home'}
      <IconHome />
    {:else}
      <IconHomeOutline />
    {/if}
  </a>

  <a href="/search" class:current={!flyoutOpen && current === 'search'} class:disabled={flyoutOpen}>
    {#if current === 'search'}
      <IconSearch />
    {:else}
      <IconSearchOutline />
    {/if}
  </a>

  <button
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
  </button>

  <a
    href="/week/{format(closestMonday(new Date()), 'yyyy-MM-dd')}"
    class:current={!flyoutOpen && current === 'events'}
    class:disabled={flyoutOpen}
  >
    {#if current === 'events'}
      <IconCalendar />
    {:else}
      <IconCalendarOutline />
    {/if}
  </a>

  <a href="/more" class:current={!flyoutOpen && current === 'more'} class:disabled={flyoutOpen}>
    {#if current === 'more'}
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

<!-- svelte-ignore a11y-click-events-have-key-events handled by svelte:window above -->
<div
  class="flyout-backdrop"
  on:click={() => {
    flyoutOpen = false;
  }}
  class:open={flyoutOpen}
>
  <section class="flyout" class:open={flyoutOpen}>
    {#if $me?.admin}
      <a href="/bar-weeks">
        <IconBarWeek />
        <span>Semaine de bar</span>
      </a>
    {/if}

    <a href="/groups">
      <IconGroup />
      <span>Groupes</span>
    </a>

    {#if $me?.admin}
      <a href="/announcements">
        <IconAnnouncement />
        <span>Annonces</span>
      </a>
    {/if}

    <a href="/frappe/upload">
      <IconDocument />
      <span>Frappe</span>
    </a>

    <a href="/articles/create">
      <IconArticle />
      <span>Article</span>
    </a>

    <a href="/events/create">
      <IconEvent />
      <span>Événement</span>
    </a>

    {#if $me?.admin || $me?.canEditUsers}
      <a href="/users">
        <IconPeople />
        <span>Inscriptions</span>
      </a>
    {/if}
  </section>
</div>

<style>
  nav {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 3;
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-evenly;
    height: 4rem;
    background: var(--bg);
    border-top: var(--border-block) solid rgb(0 0 0 / 5%);
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
    color: var(--primary-bg);
  }

  .flyout-backdrop.open {
    position: fixed;
    inset: 0;
    z-index: 1;
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
    z-index: 2;
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
</style>
