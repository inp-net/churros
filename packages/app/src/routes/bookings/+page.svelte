<script lang="ts">
  import CardTicket from '$lib/components/CardTicket.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { closestMonday } from '$lib/dates';
  import { format } from 'date-fns';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<NavigationTabs
  tabs={[
    { name: 'Semaine', href: `/events/week/${format(closestMonday(new Date()), 'yyyy-MM-dd')}` },
    { name: 'Planning', href: '/events/planning' },
    { name: 'Mes places', href: '.' },
  ]}
/>

<ul class="nobullet">
  {#each data.registrationsOfUser.edges as { node, node: { id } }}
    <li>
      <CardTicket href="/bookings/{id.replace(/^r:/, '')}/" {...node} />
    </li>
  {/each}
</ul>

<style>
  ul {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    align-items: center;
    max-width: 600px;
    margin: 2rem auto 0;
  }

  li {
    width: 100%;
  }
</style>
