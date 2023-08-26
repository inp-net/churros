<script lang="ts">
  import IconIssue from '~icons/mdi/chat-alert-outline';
  import IconNotif from '~icons/mdi/bell-outline';
  import IconNotifFilled from '~icons/mdi/bell';
  import IconTicket from '~icons/mdi/ticket-outline';
  import IconTicketFilled from '~icons/mdi/ticket-confirmation';
  import IconAccount from '~icons/mdi/account-circle-outline';

  import ButtonSecondary from './ButtonSecondary.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import { me } from '$lib/session';
  import { env } from '$env/dynamic/public';
  import { page } from '$app/stores';
  import { zeus } from '$lib/zeus';
  import ButtonBack from './ButtonBack.svelte';
  import { formatDate } from '$lib/dates';
  import ButtonGhost from './ButtonGhost.svelte';
  const dispatch = createEventDispatcher();

  onMount(() => {
    window.addEventListener('scroll', () => {
      scrolled = window.scrollY >= 3;
    });
  });

  let scrolled = false;
  $: scanningTickets = $page.url.pathname.endsWith('/scan/');

  let currentEvent: undefined | { title: string; startsAt: Date } = undefined;

  onMount(async () => {
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
    <a href="/"><img class="logo" src="/logo.png" alt="logo de l'AE" /></a>
  {/if}

  <div class="actions">
    {#if scanningTickets}
      <img class="logo" src="/logo.png" alt="logo de l'AE" />
    {:else}
      <ButtonGhost
        title="Signaler un bug ou proposer une idée"
        on:click={() => dispatch('report-issue')}
        style="color:red"><IconIssue /></ButtonGhost
      >
      {#if $me}
        <ButtonGhost href="/notifications/">
          {#if $page.url.pathname === '/notifications/'}
            <IconNotifFilled />
          {:else}
            <IconNotif />{/if}</ButtonGhost
        >
        <ButtonGhost href="/bookings/"
          >{#if $page.url.pathname.startsWith('/bookings')}<IconTicketFilled />{:else}
            <IconTicket />{/if}</ButtonGhost
        >
        <ButtonGhost href="/users/{$me?.uid}">
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

<style lang="css">
  nav {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 10;
    display: flex;
    flex-direction: row;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    margin: 0;
    background: var(--bg);
    transition: box-shadow 0.25s ease;
  }

  nav.transparent {
    color: white;
    background: transparent;

    --text: white;
  }

  nav.scrolled {
    box-shadow: 0 10px 20px 0 rgb(0 0 0 / 5%);
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    font-size: 1.3em;
  }

  img.logo {
    width: 6rem;
    height: 3rem;
    object-fit: cover;
  }

  .profilepic {
    --size: calc(1.3em);

    width: var(--size);
    height: var(--size);
    overflow: hidden;
    border-radius: 50%;

    /* border: 3px solid var(--text); */
  }

  .current-event {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>
