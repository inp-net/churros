<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { fragment, graphql, type NavigationTop, type NavigationTopCurrentEvent } from '$houdini';
  import { formatDate } from '$lib/dates';
  import { loaded, loading, onceLoaded } from '$lib/loading';
  import { theme } from '$lib/theme';
  import IconAccount from '~icons/mdi/account-circle-outline';
  import IconNotifFilled from '~icons/mdi/bell';
  import IconNotif from '~icons/mdi/bell-outline';
  import IconIssue from '~icons/mdi/chat-alert-outline';
  import IconSearch from '~icons/mdi/search';
  import ButtonBack from './ButtonBack.svelte';
  import ButtonGhost from './ButtonGhost.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import LogoChurros from './LogoChurros.svelte';
  import ModalReportIssue from './ModalReportIssue.svelte';

  export let scrolled = false;
  let deviceWidth = browser ? window.innerWidth : 500;
  let reportIssueDialogElement: HTMLDialogElement;

  export let userIsLoading = false;

  export let user: NavigationTop | null;
  $: data = fragment(
    user,
    graphql(`
      fragment NavigationTop on User @loading {
        pictureURL
        uid
      }
    `),
  );

  export let event: NavigationTopCurrentEvent | null;
  $: currentEvent = fragment(
    event,
    graphql(`
      fragment NavigationTopCurrentEvent on Event @loading {
        title
        startsAt
      }
    `),
  );

  $: scanningTickets = Boolean($currentEvent);
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
        <h1>{$currentEvent?.title ?? 'Chargement…'}</h1>
        <p>{$currentEvent ? formatDate($currentEvent.startsAt) : 'Chargement…'}</p>
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
      {#if $data || userIsLoading}
        <ButtonGhost href="/notifications/" help="Notifications" style="color:var(--nav-text)">
          {#if $page.url.pathname === '/notifications/'}
            <IconNotifFilled />
          {:else}
            <IconNotif />{/if}</ButtonGhost
        >
        <ButtonGhost href="/search/" help="Rechercher" style="color:var(--nav-text)"
          ><IconSearch /></ButtonGhost
        >
        <ButtonGhost
          loading={!$data || ($data && !loaded($data.uid)) || !loaded($data.pictureURL)}
          href={onceLoaded($data?.uid, (uid) => `/users/${uid}`, '')}
          help="Mon profil"
          style="color:var(--nav-text)"
        >
          {#if $data?.pictureURL}
            <img class="profilepic" src={loading($data.pictureURL, '')} alt="Moi" />
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
