<script lang="ts">
  import type { PageData } from './$types';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';
  import ItemBuyingTable from '$lib/components/ItemBuyingTable.svelte';
  import BackButton from '$lib/components/ButtonBack.svelte';

  export let data: PageData;

  const { shopItem } = data;

  let warningToastId: string;

  onMount(() => {
    warningToastId = toasts.warn('Page en bêta', 'Les boutiques sont en phase de test', {
      lifetime: Number.POSITIVE_INFINITY,
    });
  });

  onDestroy(async () => {
    await toasts.remove(warningToastId);
  });
</script>

<div class="header">
  <BackButton go="../." />
  <h1>Liste des payements pour {shopItem.name}</h1>
</div>

<div class="content">
  {#if shopItem.shopPayments.length === 0}
    <h2 class="none">Aucune commande ;(</h2>
  {:else}
    <ItemBuyingTable payments={shopItem.shopPayments} options={shopItem.itemOptions} />
  {/if}
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .header {
    display: flex;
    gap: 1em;
    align-items: center;
  }
</style>
