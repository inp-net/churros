<script lang="ts">
  import { page } from '$app/stores';
  import { scanningEventsRouteID } from '$lib/navigation';
  import type { MOBILE_NAVIGATION_TABS } from '$lib/tabs';
  import { theme } from '$lib/theme';
  import { tooltip } from '$lib/tooltip';
  import IconAccount from '~icons/msl/account-circle';
  import IconAccountOutline from '~icons/msl/account-circle-outline';
  import IconCalendar from '~icons/msl/calendar-month';
  import IconCalendarOutline from '~icons/msl/calendar-today-outline';
  import IconHome from '~icons/msl/home';
  import IconHomeOutline from '~icons/msl/home-outline';
  import IconSearch from '~icons/msl/search';
  import IconDotsCircle from '~icons/msl/view-comfy-alt';
  import IconDotsCircleOutline from '~icons/msl/view-comfy-alt-outline';

  export let current: (typeof MOBILE_NAVIGATION_TABS)[number];
</script>

<nav class:transparent={$page.route.id === scanningEventsRouteID} class={$theme}>
  {#if $page.url.pathname === '/'}
    <button
      class="current"
      on:click={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    >
      <IconHome style="color:var(--primary)" />
    </button>
  {:else}
    <a href="/" class:current={current === 'home'} use:tooltip={'Mon feed'}>
      {#if current === 'home'}
        <IconHome style="color:var(--nav-text)" />
      {:else}
        <IconHomeOutline style="color:var(--nav-text)" />
      {/if}
    </a>
  {/if}

  {#if $page.url.pathname === '/groups/'}
    <button
      class="current"
      on:click={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    >
      <IconSearch></IconSearch>
    </button>
  {:else}
    <a href="/search" class:current={current === 'search'} use:tooltip={'Clubs'}>
      {#if current === 'search'}
        <IconSearch style="color:var(--nav-text);stroke-width:10px;" />
      {:else}
        <IconSearch style="color:var(--nav-text)" />
      {/if}
    </a>
  {/if}

  <a href="/events" class:current={current === 'events'} use:tooltip={'Événements'}>
    {#if current === 'events'}
      <IconCalendar style="color:var(--nav-text)" />
    {:else}
      <IconCalendarOutline style="color:var(--nav-text)" />
    {/if}
  </a>

  <a href="/services/" class:current={current === 'services'} use:tooltip={'Les autres services'}>
    {#if current === 'services'}
      <IconDotsCircle style="color:var(--nav-text)" />
    {:else}
      <IconDotsCircleOutline style="color:var(--nav-text)" />
    {/if}
  </a>

  <a href="/me" class:current={current === 'me'}>
    {#if current === 'services'}
      <IconAccount style="color:var(--nav-text)" />
    {:else}
      <IconAccountOutline style="color:var(--nav-text)" />
    {/if}
  </a>
</nav>

<svelte:window
  on:keydown={(e) => {
    if (!(e instanceof KeyboardEvent)) return;
    if (e.key === 'Escape') e.preventDefault();
  }}
/>

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

  @keyframes fade-in-backdrop {
    from {
      background: rgb(0 0 0 / 0%);
    }

    to {
      background: rgb(0 0 0 / 50%);
    }
  }

  @media (min-width: 900px) {
    nav {
      display: none;
    }
  }
</style>
