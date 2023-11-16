<script lang="ts">
  import type { PageData } from './$types';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';

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
    <div>
      <p>{shopItem.name}</p>
      <p>{shopItem.stock}*{shopItem.price} €</p>
      <p>max: {shopItem.max}</p>
      <p>{shopItem.description}</p>
      <a href="/groups/{shopItem.group.uid}/shop/{shopItem.id}">Acheter</a>
    </div>
  {/each}
</div>
