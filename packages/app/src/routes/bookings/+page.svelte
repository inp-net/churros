<script lang="ts">
  import CardTicket from '$lib/components/CardTicket.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<h1>Mes places</h1>

<ul class="nobullet">
  {#each data.registrationsOfUser.edges as { node, node: { id } }}
    <li>
      <CardTicket href="/bookings/{id.replace(/^r:/, '')}/" {...node} />
    </li>
  {/each}
</ul>

<style>
  h1 {
    margin-bottom: 2rem;
    text-align: center;
  }

  ul {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    align-items: center;
    max-width: 600px;
    margin: 0 auto;
  }

  li {
    width: 100%;
  }
</style>
