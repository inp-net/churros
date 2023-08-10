<script lang="ts">
  import { page } from '$app/stores';
  import TopBar from '$lib/components/NavigationTop.svelte';
  import { theme } from '$lib/theme.js';
  import { onMount } from 'svelte';
  import '../design/app.scss';
  import NavigationBottom from '$lib/components/NavigationBottom.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import IconClose from '~icons/mdi/close';
  import { browser } from '$app/environment';
  import { zeus } from '$lib/zeus';
  import { afterNavigate, beforeNavigate } from '$app/navigation';

  function currentTab(url: URL): 'events' | 'search' | 'more' | 'home' {
    const starts = (segment: string) => url.pathname.startsWith(segment);

    if (starts('/search')) return 'search';
    if (starts('/week') || starts('/bookings') || starts('/events')) return 'events';
    if (starts('/more')) return 'more';
    return 'home';
  }

  let announcements = [] as Array<{
    title: string;
    bodyHtml: string;
    warning: boolean;
    id: string;
  }>;

  type NProgress = {
    start: () => void;
    done: () => void;
    remove: () => void;
  };

  beforeNavigate(() => {
    (window as unknown as Window & { NProgress: NProgress }).NProgress.start();
  });
  afterNavigate(() => {
    const { NProgress } = window as unknown as Window & { NProgress: NProgress };

    NProgress.done();
    setTimeout(() => {
      NProgress.remove();
    }, 1000);
  });

  onMount(async () => {
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

    let currentTheme = $theme;
    theme.subscribe(($theme) => {
      if (currentTheme) document.documentElement.classList.remove(currentTheme);
      if ($theme === 'system') {
        document.documentElement.classList.add(
          window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        );
      } else {
        document.documentElement.classList.add($theme);
      }

      currentTheme = $theme;
    });
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
</script>

<svelte:head>
  <title>Centraverse</title>
</svelte:head>

<TopBar />

<div class="layout">
  {#if announcements.length > 0 && !scanningTickets && !showingTicket}
    <section class="announcements fullsize">
      {#each announcements.filter(({ id }) => !announcementHiddenByUser(id)) as { title, bodyHtml, warning, id } (id)}
        <article class="announcement {warning ? 'warning' : 'primary'}">
          <div class="text">
            <strong>{title}</strong>
            <div class="body">
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

  <main class:fullsize={pageIsFullsize()}>
    <slot />
  </main>
</div>

<NavigationBottom current={currentTab($page.url)} />

<style lang="scss">
  .layout {
    // max-width: 100rem;
    padding-top: 5rem; // XXX equal to topbar's height
    padding-bottom: 5rem; /// XXX equal to navbar's height
    margin: auto;

    > *:not(.fullsize) {
      padding: 0 0.5rem;
    }
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
</style>
