<script lang="ts">
  import type { PageData } from './$types';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ShopItemTable from '$lib/components/ShopItemTable.svelte';

  export let data: PageData;

  const { shopItems } = data.group;

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

<h1>Gestion de la boutique</h1>

<div class="content">
  {#if shopItems?.length === 0}
    <ButtonPrimary href="create">Ajouter un produit</ButtonPrimary>
  {/if}
  <ShopItemTable {shopItems} />
</div>
