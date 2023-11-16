<script lang="ts">
  import type { PageData } from './$types';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputNumber from '$lib/components/InputNumber.svelte';

  export let data: PageData;

  const { shopItem } = data;

  let warningToastId: string;

  let quantity = 1;
  let max = Math.min(shopItem.max, shopItem.stock);

  onMount(() => {
    warningToastId = toasts.warn('Page en bêta', 'Les boutiques sont en cours de fonctionnement', {
      lifetime: Number.POSITIVE_INFINITY,
    });
  });

  onDestroy(async () => {
    await toasts.remove(warningToastId);
  });
</script>

<div class="content">
  <h2>{shopItem.name}</h2>
  <p>{shopItem.stock}*{shopItem.price} €</p>
  <p>max: {shopItem.max}</p>
  <p>{shopItem.description}</p>
  <input type="number" bind:value={quantity} min="1" {max} />
  <ButtonPrimary>Acheter</ButtonPrimary>
</div>
