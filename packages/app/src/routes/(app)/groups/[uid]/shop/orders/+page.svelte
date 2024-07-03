<script lang="ts">
  import BackButton from '$lib/components/ButtonBack.svelte';
  import ItemOrder from '$lib/components/ItemOrder.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { toasts } from '$lib/toasts';
  import { onDestroy, onMount } from 'svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  const { group: {shopOrders} } = data;

  let warningToastId: string;

  const isOnClubBoard =
    data.group.boardMembers.some((s) => s.member.uid === data.me?.uid) || data.me?.admin;

  onMount(() => {
    warningToastId = toasts.warn('Page en bêta', 'Les boutiques sont en phase de test', {
      lifetime: Number.POSITIVE_INFINITY,
    })!;
  });

  onDestroy(async () => {
    await toasts.remove(warningToastId);
  });
  let tabs = [
    { name: 'Boutique', href: '../.' },
    { name: 'Mes commandes', href: '.' },
  ];
  if (isOnClubBoard) {
    tabs = [
      { name: 'Boutique', href: '../.' },
      { name: 'Mes commandes', href: '.' },
      { name: 'Gestion', href: '../sales/' },
    ];
  }
</script>

<NavigationTabs {tabs} />
<div class="header">
  <BackButton go="../.." />
  <h1>Mes achats</h1>
</div>
<div class="content">
  {#if shopOrders.length === 0}
    <p class="text-center">Aucun article</p>
  {/if}
  {#each shopOrders as order}
    <ItemOrder {order} />
  {/each}
</div>

<style>
  .header {
    display: flex;
    gap: 1em;
    align-items: center;
    margin: 1em auto;
  }

  .content {
    display: flex;
    flex-flow: row wrap;
    gap: 1em;
    align-items: stretch;
    margin: 1em auto;
  }

  .text-center {
    text-align: center;
  }

  @media only screen and (min-width: 900px) and (max-width: 990px) {
    .content {
      justify-content: center;
    }
  }

  @media only screen and (max-width: 690px) {
    .content {
      justify-content: center;
    }
  }
</style>
