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
  import { tooltip } from '$lib/tooltip';
  import ModalReportIssue from './ModalReportIssue.svelte';

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

<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>
<div class="snow"></div>

<nav id="navigation-top" class:scrolled class:transparent={scanningTickets}>
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
        <div
          class="button-relocation-help"
          use:tooltip={$page.url.pathname.startsWith('/search') ||
          window.localStorage.getItem('hideNewSearchLocationHelp')
            ? undefined
            : {
                content: 'La recherche est maintenant ici! <button>OK</button>',
                showOnCreate: true,
                allowHTML: true,
                onHidden() {
                  window.localStorage.setItem('hideNewSearchLocationHelp', 'true');
                },
              }}
        >
          <ButtonGhost href="/search/" help="Rechercher"><IconSearch /></ButtonGhost>
        </div>
        <ButtonGhost href="/users/{$me?.uid}" help="Mon profil">
          {#if $me.pictureFile}
            <img class="profilepic" src="{env.PUBLIC_STORAGE_URL}{$me.pictureFile}" alt="Profil" />
          {:else}
            <IconAccount />
          {/if}
        </ButtonGhost>
      {:else}
        <ButtonSecondary href="/register/">Inscription</ButtonSecondary>
        <ButtonSecondary href="/login/?{new URLSearchParams({ to: $page.url.pathname }).toString()}"
          >Connexion</ButtonSecondary
        >
      {/if}
    {/if}
  </div>
</nav>

<style lang="scss">
  @use 'sass:math';

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

  nav.scrolled {
    box-shadow: 0 10px 20px 0 rgb(0 0 0 / 5%);
  }

  nav.transparent {
    color: white;
    background: transparent;

    --text: white;
  }

  @function random-range($min, $max) {
    $rand: math.random();
    $random-range: $min + math.floor($rand * (($max - $min) + 1));
    @return $random-range;
  }

  .snow {
    position: absolute;
    z-index: 0;
    width: 10px;
    height: 10px;
    background: white;
    border-radius: 50%;

    $total: 200;

    @for $i from 1 through $total {
      $random-x: math.random(1000000) * 0.0001vw;
      $random-offset: random-range(-100000, 100000) * 0.0001vw;
      $random-x-end: $random-x + $random-offset;
      $random-x-end-yoyo: $random-x + (math.div($random-offset, 2));
      $random-yoyo-time: math.div(random-range(30000, 80000), 100000);
      $random-yoyo-y: $random-yoyo-time * 100vh;
      $random-scale: math.random(10000) * 0.0001;
      $fall-duration: random-range(10, 30) * 1s;
      $fall-delay: math.random(30) * -1s;

      &:nth-child(#{$i}) {
        opacity: math.random(10000) * 0.0001;
        transform: translate($random-x, -10px) scale($random-scale);
        animation: fall-#{$i} $fall-duration $fall-delay linear infinite;
      }

      @keyframes fall-#{$i} {
        #{percentage($random-yoyo-time)} {
          transform: translate($random-x-end, $random-yoyo-y) scale($random-scale);
        }

        100% {
          transform: translate($random-x-end-yoyo, 100vh) scale($random-scale);
        }
      }
    }
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
