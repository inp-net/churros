<script lang="ts">
  import type { PageData } from './$types';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';

  export let data: PageData;

  const { orders } = data;

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

<h1>Mes achats</h1>

<div class="content">
  {#if orders.length === 0}
    <p class="text-center">Aucun article</p>
  {/if}
  {#each orders as order}
    <div>
      <p>{order.shopItem.name}</p>
    </div>
  {/each}
</div>
