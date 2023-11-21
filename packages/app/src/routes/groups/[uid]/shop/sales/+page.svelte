<script lang="ts">
  import type { PageData } from './$types';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';

  export let data: PageData;

  const { shopItems } = data;

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
  {#if shopItems.length === 0}
    <ButtonPrimary href="create">Ajouter un produit</ButtonPrimary>
  {/if}
  {#each shopItems as item}
    <div>
      <h2>{item.name}</h2>
      <p>{item.stockLeft}/{item.stock}</p>
      <p>{item.price} €</p>
      <ButtonPrimary href="/groups/{item.group.uid}/shop/sales/{item.id}">Voir</ButtonPrimary>
    </div>
  {/each}
</div>
