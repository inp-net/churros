<script lang="ts">
  import IconIssue from '~icons/mdi/chat-alert-outline';
  import IconNotif from '~icons/mdi/bell-outline';
  import IconNotifFilled from '~icons/mdi/bell';
  import IconSearch from '~icons/mdi/search';
  import IconAccount from '~icons/mdi/account-circle-outline';

  import ButtonSecondary from './ButtonSecondary.svelte';
  import { me } from '$lib/session';
  import { env } from '$env/dynamic/public';
  import { page } from '$app/stores';
  import { zeus } from '$lib/zeus';
  import ButtonBack from './ButtonBack.svelte';
  import { formatDate } from '$lib/dates';
  import ButtonGhost from './ButtonGhost.svelte';
  import { afterNavigate } from '$app/navigation';
  import LogoChurros from './LogoChurros.svelte';
  import { browser } from '$app/environment';
  import ModalReportIssue from './ModalReportIssue.svelte';
  import { theme } from '$lib/theme';

  export let scrolled = false;
  $: scanningTickets = $page.url.pathname.endsWith('/scan/');

  let deviceWidth = browser ? window.innerWidth : 500;

  let currentEvent: undefined | { title: string; startsAt: Date } = undefined;
  let reportIssueDialogElement: HTMLDialogElement;

  afterNavigate(async () => {
    if ($page.url.pathname.endsWith('/scan/')) {
      try {
        const { event } = await $zeus.query({
          event: [
            { uid: $page.params.uid, groupUid: $page.params.group },
            { title: true, startsAt: true },
          ],
        });
        currentEvent = event;
      } catch {}
    }
  });
</script>

<svelte:window
  on:resize={() => {
    deviceWidth = window.innerWidth;
  }}
/>

<ModalReportIssue bind:element={reportIssueDialogElement} />

<nav id="navigation-top" class:scrolled class:transparent={scanningTickets} class={$theme}>
  {#if scanningTickets}
    <div class="current-event">
      <ButtonBack />
      <div class="event-name">
        <h1>{currentEvent?.title ?? 'Chargement…'}</h1>
        <p>{currentEvent ? formatDate(currentEvent.startsAt) : 'Chargement…'}</p>
      </div>
    </div>
  {:else}
    <a href="/" class="wordmark">
      <LogoChurros wordmark={deviceWidth > 400} />
    </a>
  {/if}

  <div class="actions">
    {#if scanningTickets}
      <ButtonGhost
        help="Signaler un bug ou proposer une idée"
        on:click={() => {
          reportIssueDialogElement.showModal();
        }}
        style="color:red"><IconIssue /></ButtonGhost
      >
      <div class="wordmark">
        <LogoChurros />
      </div>
    {:else}
      <ButtonGhost
        help="Signaler un bug ou proposer une idée"
        on:click={() => {
          reportIssueDialogElement.showModal();
        }}
        style="color:red"><IconIssue /></ButtonGhost
      >
      {#if $me}
        <ButtonGhost href="/notifications/" help="Notifications" style="color:var(--nav-text)">
          {#if $page.url.pathname === '/notifications/'}
            <IconNotifFilled />
          {:else}
            <IconNotif />{/if}</ButtonGhost
        >
        <ButtonGhost href="/search/" help="Rechercher" style="color:var(--nav-text)"
          ><IconSearch /></ButtonGhost
        >
        <ButtonGhost href="/users/{$me?.uid}" help="Mon profil" style="color:var(--nav-text)">
          {#if $me.pictureFile}
            <img class="profilepic" src="{env.PUBLIC_STORAGE_URL}{$me.pictureFile}" alt="Profil" />
          {:else}
            <IconAccount />
          {/if}
        </ButtonGhost>
      {:else}
        <ButtonSecondary href="/register/">Inscription</ButtonSecondary>
        <ButtonSecondary
          href="/login/?{new URLSearchParams({
            to: $page.url.pathname,
            ...Object.fromEntries($page.url.searchParams.entries()),
          }).toString()}">Connexion</ButtonSecondary
        >
      {/if}
    {/if}
  </div>
</nav>

<style lang="scss">
  nav {
    z-index: 10;
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 1rem 1.5rem;
    margin: 0;
    background: var(--nav-top-background, var(--bg));
    background-repeat: repeat-x;
    background-size: auto 100%;
    transition: box-shadow 0.25s ease;
  }

  nav.scrolled {
    box-shadow: 0 10px 20px 0 rgb(0 0 0 / 5%);
  }

  nav.transparent {
    color: white;
    background: transparent;

    --text: white;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    font-size: 1.3em;
  }

  .wordmark {
    display: flex;
    align-items: start;
    width: auto;
    height: 3rem;
    object-fit: cover;
  }

  .profilepic {
    --size: calc(1.3em);

    width: var(--size);
    height: var(--size);
    overflow: hidden;
    object-fit: cover;
    border-radius: 50%;

    /* border: 3px solid var(--text); */
  }

  .current-event {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    max-width: 60%;

    h1 {
      overflow: hidden;
      font-size: 1.2rem;
      text-overflow: ellipsis;
      white-space: nowrap;
      /* stylelint-disable-next-line property-no-unknown */
      line-clamp: 1;
    }
  }

  .actions > * {
    flex-shrink: 0;
  }

  .transparent .wordmark {
    width: 3.5rem;
  }
</style>
