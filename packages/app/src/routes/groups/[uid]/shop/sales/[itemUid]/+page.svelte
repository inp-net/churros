<script lang="ts">
  import type { PageData } from './$types';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';

  export let data: PageData;

  const { shopItem } = data;

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

<h1>Liste des payements pour {shopItem.name}</h1>

<div class="content">
  {#if shopItem.shopPayments.length === 0}
    <ButtonPrimary href="create">Aucun payement</ButtonPrimary>
  {/if}
  {#each shopItem.shopPayments as payment}
    <div>
      <h2>{payment.user.uid}</h2>
      <p>{payment.quantity}</p>
      <p>{payment.totalPrice} €</p>
      <p>Par {payment.paymentMethod}</p>
    </div>
  {/each}
</div>
