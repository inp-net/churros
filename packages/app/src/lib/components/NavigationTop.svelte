<script lang="ts">
  import IconAccount from '~icons/mdi/account-circle-outline';
  import IconNotifFilled from '~icons/mdi/bell';
  import IconNotif from '~icons/mdi/bell-outline';
  import IconIssue from '~icons/mdi/chat-alert-outline';
  import IconSearch from '~icons/mdi/search';

  import { browser } from '$app/environment';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { env } from '$env/dynamic/public';
  import { fragment, graphql, type NavigationTopMe } from '$houdini';
  import { formatDate } from '$lib/dates';
  import { theme } from '$lib/theme';
  import { zeus } from '$lib/zeus';
  import ButtonBack from './ButtonBack.svelte';
  import ButtonGhost from './ButtonGhost.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import LogoChurros from './LogoChurros.svelte';
  import ModalReportIssue from './ModalReportIssue.svelte';

  export let scrolled = false;
  $: scanningTickets = $page.url.pathname.endsWith('/scan/');

  let deviceWidth = browser ? window.innerWidth : 500;

  let currentEvent: undefined | { title: string; startsAt: Date } = undefined;
  let reportIssueDialogElement: HTMLDialogElement;

  export let meStore: NavigationTopMe | undefined;
  $: me = fragment(
    meStore,
    graphql`
      fragment NavigationTopMe on User {
        uid
        pictureFile
      }
    `,
  );

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
        <ButtonGhost href="/notifications/" help="Notifications">
          {#if $page.url.pathname === '/notifications/'}
            <IconNotifFilled />
          {:else}
            <IconNotif />{/if}</ButtonGhost
        >
        <ButtonGhost href="/search/" help="Rechercher"><IconSearch /></ButtonGhost>
        <ButtonGhost href="/users/{$me?.uid}" help="Mon profil">
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
    background-color: var(--bg);
    transition: box-shadow 0.25s ease;
  }

  nav.noel {
    background-color: transparent;
    background-image: url('/noel-topbar.png');
    background-repeat: repeat;
    background-size: contain;
  }

  nav.gd7t {
    background-color: transparent;
    background-image: url('/gd7t-top.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
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
    border-radius: 50%;
    object-fit: cover;

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
