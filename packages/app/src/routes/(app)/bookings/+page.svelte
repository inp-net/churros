<script lang="ts">
  import CardTicket from '$lib/components/CardTicket.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { closestMonday } from '$lib/dates';
  import { format } from 'date-fns';
  import type { PageData } from './$types';
  import { me } from '$lib/session';
  import { goto } from '$app/navigation';
  import InputText from '$lib/components/InputText.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';

  export let data: PageData;
  let code = '';
</script>

<NavigationTabs
  tabs={[
    { name: 'Semaine', href: `/events/week/${format(closestMonday(new Date()), 'yyyy-MM-dd')}` },
    { name: 'Planning', href: '/events/planning' },
    { name: 'Mes places', href: '.' },
  ]}
/>

{#if $me}
  <ul class="nobullet">
    {#each data.registrationsOfUser?.edges ?? [] as { node, node: { id } }}
      <li>
        <CardTicket href="/bookings/{id.replace(/^r:/, '')}/" {...node} />
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

<style>
  ul {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    align-items: center;
    max-width: 600px;
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
