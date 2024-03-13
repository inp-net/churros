<script lang="ts">
  import type { PageData } from './$types';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';
  import ShopItem from '$lib/components/ShopItem.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';

  export let data: PageData;

  const { shopItems } = data.group;

  let warningToastId: string;

  onMount(() => {
    warningToastId = toasts.warn('Page en bêta', 'Les boutiques sont en phase de développement', {
      lifetime: Number.POSITIVE_INFINITY,
    });
  });

  onDestroy(async () => {
    await toasts.remove(warningToastId);
  });
</script>

<NavigationTabs
  tabs={[
    { name: 'Boutique', href: '.' },
    { name: 'Mes commandes', href: './orders' },
  ]}
/>
<div class="content">
  {#if shopItems.length === 0}
    <p class="text-center">Aucun article</p>
  {/if}
  {#each shopItems as shopItem}
    <ShopItem {shopItem} />
  {/each}
</div>

<style>
  .content {
    display: flex;
    flex-flow: row wrap;
    gap: 1em;
    align-items: stretch;
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
