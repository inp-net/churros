<script lang="ts">
  import type { PageData } from './$types';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';
  import ShopItem from '$lib/components/ShopItem.svelte';

  export let data: PageData;

  const { shopItems } = data;

  let warningToastId: string;

  onMount(() => {
    warningToastId = toasts.warn(
      'Page en bêta',
      "Les boutiques sont en phase de développement",
      {
        lifetime: Number.POSITIVE_INFINITY,
      },
    );
  });

  onDestroy(async () => {
    await toasts.remove(warningToastId);
  });
</script>

<div class="content">
  {#if shopItems.length === 0}
    <p class="text-center">Aucun article</p>
  {/if}
  {#each shopItems as shopItem}
    <ShopItem {shopItem} />
  {/each}
</div>
