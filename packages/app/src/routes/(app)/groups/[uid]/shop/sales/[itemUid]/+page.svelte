<script lang="ts">
  import type { PageData } from './$types';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';
  import ItemBuyingTable from '$lib/components/ItemBuyingTable.svelte';

  export let data: PageData;

  const { shopItem } = data;

  let warningToastId: string;

  onMount(() => {
    warningToastId = toasts.warn('Page en bêta', 'Les boutiques sont en cours de fonctionnement', {
      lifetime: Number.POSITIVE_INFINITY,
    });
  });

  onDestroy(async () => {
    await toasts.remove(warningToastId);
  });
</script>

<h1>Liste des payements pour {shopItem.name}</h1>

<div class="content">
  {#if shopItem.shopPayments.length === 0}
    <h2 class="none">Aucune commande ;(</h2>
  {:else}
    <ItemBuyingTable payments={shopItem.shopPayments} />
  {/if}
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
