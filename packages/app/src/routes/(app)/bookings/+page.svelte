<script lang="ts">
  import { goto } from '$app/navigation';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import CardTicket from '$lib/components/CardTicket.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { closestMonday } from '$lib/dates';
  import { notNull } from '$lib/typing';
  import { format } from 'date-fns';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageBookings } = data);

  let code = '';
</script>

<NavigationTabs
  tabs={[
    { name: 'Semaine', href: `/events/${format(closestMonday(new Date()), 'yyyy-MM-dd')}` },
    { name: 'Planning', href: '/events' },
    { name: 'Mes places', href: '.' },
  ]}
/>

<div class="content">
  {#if $PageBookings.data?.me}
    <ul class="nobullet">
      {#each $PageBookings.data.me.bookings.nodes.filter(notNull) as booking (booking.id)}
        <li>
          <CardTicket href="/bookings/{booking.code}/" {booking} />
        </li>
      {/each}
    </ul>
  {:else}
    <form
      class="claim-code"
      on:submit|preventDefault={async () => {
        await goto(`/bookings/${code}`);
      }}
    >
      <InputText label="Code de réservation" bind:value={code} />
      <ButtonPrimary submits>Accéder à ma place</ButtonPrimary>
    </form>
  {/if}
</div>

<style>
  .content {
    width: 100%;
    max-width: 600px;
  }

  ul {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    align-items: center;
    margin: 2rem auto 0;
  }

  form.claim-code {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: center;
  }

  li {
    width: 100%;
  }
</style>
