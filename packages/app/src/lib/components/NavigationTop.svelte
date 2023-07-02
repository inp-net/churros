<script lang="ts">
  import { page } from '$app/stores';
  import type { LayoutData } from '.svelte-kit/types/src/routes/$types';

  import IconIssue from '~icons/mdi/chat-alert-outline';
  import IconNotif from '~icons/mdi/bell-outline';
  import IconTicket from '~icons/mdi/ticket-outline';
  import IconAccount from '~icons/mdi/account-circle-outline';

  import ButtonSecondary from './ButtonSecondary.svelte';

  $: ({ me, token } = $page.data as LayoutData);
</script>

<nav id="navigation-top">
  <a href="/"><img src="/logo.png" alt="logo de l'AE" /></a>

  <div class="actions">
    {#if me && token}
      <a href="https://git.inpt.fr/inp-net/centraverse/-/issues/new" style="color:red"
        ><IconIssue /></a
      >
      <a href="/notifications/"><IconNotif /></a>
      <a href="/bookings/"><IconTicket /></a>
      <a href="/me/"><IconAccount /></a>
    {:else}
      <div><ButtonSecondary href="/register/">Créer un compte</ButtonSecondary></div>
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
    display: flex;
    flex-direction: row;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    margin: 0;
    background: var(--bg);
    box-shadow: 0 10px 20px 0 rgb(0 0 0 / 5%);
  }

  .actions {
    display: flex;
    gap: 1.3rem;
    font-size: 1.3em;
  }

  img {
    width: 6rem;
    height: 3rem;
    object-fit: cover;
  }
</style>
