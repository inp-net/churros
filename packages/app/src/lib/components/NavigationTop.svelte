<script lang="ts">
  import IconIssue from '~icons/mdi/chat-alert-outline';
  import IconNotif from '~icons/mdi/bell-outline';
  import IconNotifFilled from '~icons/mdi/bell';
  import IconTicket from '~icons/mdi/ticket-outline';
  import IconTicketFilled from '~icons/mdi/ticket-confirmation';
  import IconAccount from '~icons/mdi/account-circle-outline';

  import ButtonSecondary from './ButtonSecondary.svelte';
  import { onMount } from 'svelte';
  import { me } from '$lib/session';
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import { page } from '$app/stores';
  import { zeus } from '$lib/zeus';
  import ButtonBack from './ButtonBack.svelte';
  import { formatDate } from '$lib/dates';

  onMount(() => {
    window.addEventListener('scroll', () => {
      scrolled = window.scrollY >= 3;
    });
  });

  let scrolled = false;
  $: scanningTickets = $page.url.pathname.endsWith('/scan/');

  async function getCurrentEvent(page: typeof $page) {
    if (!page.url.pathname.endsWith('/scan/')) throw `not applicable`;
    try {
      const { event } = await $zeus.query({
        event: [
          { uid: page.params.event, groupUid: page.params.group },
          { title: true, startsAt: true },
        ],
      });
      return event;
    } catch {
      throw `not found`;
    }
  }
</script>

<nav id="navigation-top" class:scrolled class:transparent={scanningTickets}>
  {#await getCurrentEvent($page)}
    <a href="/"><img class="logo" src="/logo.png" alt="logo de l'AE" /></a>
  {:then currentEvent}
    <div class="current-event">
      <ButtonBack />
      <div class="event-name">
        <h1>{currentEvent.title}</h1>
        <p>{formatDate(currentEvent.startsAt)}</p>
      </div>
    </div>
  {:catch}
    <a href="/"><img class="logo" src="/logo.png" alt="logo de l'AE" /></a>
  {/await}

  <div class="actions">
    {#if scanningTickets}
      <img class="logo" src="/logo.png" alt="logo de l'AE" />
    {:else if $me}
      <a href="https://git.inpt.fr/inp-net/centraverse/-/issues/new" style="color:red"
        ><IconIssue /></a
      >
      <a href="/notifications/">
        {#if $page.url.pathname === '/notifications/'}
          <IconNotifFilled />
        {:else}
          <IconNotif />{/if}</a
      >
      <a href="/bookings/"
        >{#if $page.url.pathname.startsWith('/bookings')}<IconTicketFilled />{:else}
          <IconTicket />{/if}</a
      >
      <a href="/users/{$me?.uid}">
        {#if $me.pictureFile}
          <img class="profilepic" src="{PUBLIC_STORAGE_URL}{$me.pictureFile}" alt="Profil" />
        {:else}
          <IconAccount />
        {/if}
      </a>
    {:else}
      <div><ButtonSecondary href="/register/">Inscription</ButtonSecondary></div>
      <div><ButtonSecondary href="/login/">Connexion</ButtonSecondary></div>
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
    gap: 1.3rem;
    justify-content: center;
    font-size: 1.3em;
  }

  img.logo {
    width: 6rem;
    height: 3rem;
    object-fit: cover;
  }

  .actions a {
    display: flex;
    align-items: center;
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
