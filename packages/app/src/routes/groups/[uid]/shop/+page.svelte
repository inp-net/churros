<script lang="ts">
  import type { PageData } from './$types';
  import CardService from '$lib/components/CardService.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';

  export let data: PageData;

  const { shopItems } = data;

  let warningToastId: string;

  onMount(() => {
    warningToastId = toasts.warn(
      'Page en bêta',
      "Les pages d'écoles ne sont pas encore terminées",
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
    <p>{shopItem}</p>
  {/each}
</div>
