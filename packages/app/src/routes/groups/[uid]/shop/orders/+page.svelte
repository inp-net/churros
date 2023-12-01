<script lang="ts">
  import type { PageData } from './$types';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';

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

<NavigationTabs
  tabs={[
    { name: 'Boutique', href: '../' },
    { name: 'Mes commandes', href: '.' },
  ]}
/>
<h1>Mes achats</h1>

<div class="content">
  {#if orders.length === 0}
    <p class="text-center">Aucun article</p>
  {/if}
  {#each orders as order}
    <div>
      <h2>{order.shopItem.name}</h2>
      <p>{order.paid}</p>
      <p>{order.totalPrice} €</p>
      <ButtonPrimary href="/groups/{order.shopItem.group.uid}/shop/{order.shopItem.id}"
        >Voir</ButtonPrimary
      >
    </div>
  {/each}
</div>
