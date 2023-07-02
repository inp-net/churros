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

<nav>
  <a href="/"><img src="/logo.png" alt="logo de l'AE" /></a>

  <div>
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
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    margin: 0;
    box-shadow: 0 10px 20px 0 rgb(0 0 0 / 5%);
    box-shadow: 0 10px 20px 0 rgb(0 0 0 / 5%);
    box-shadow: 0 10px 20px 0 rgb(0 0 0 / 5%);
  }

  nav > div > div {
    display: inline-block;
  }

  nav > div > div:nth-child(n + 2) {
    margin-left: 0.8rem;
  }

  nav > div > a {
    font-size: 1.3rem;
  }

  nav > div > a:nth-child(n + 2) {
    margin-left: 2rem;
  }

  img {
    height: 6rem;
    margin: -1.5rem 0;
  }
</style>
