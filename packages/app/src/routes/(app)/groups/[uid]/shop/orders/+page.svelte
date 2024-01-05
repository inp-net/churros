<script lang="ts">
  import type { PageData } from './$types';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import ShopImageCaroussel from '$lib/components/ShopImageCaroussel.svelte';
  import BadgePaymentStatus from '$lib/components/BadgePaymentStatus.svelte';

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
    <div class="item">
      <ShopImageCaroussel url={order.shopItem.pictures.map((p) => p.path)} />
      <div class="info">
        <h2>{order.shopItem.name}</h2>
        <div class="priceinfo">
          <p>{order.totalPrice} €</p>
          <p><BadgePaymentStatus paid={order.paid} opposed={false} cancelled={false} /></p>
        </div>
      </div>
      <ButtonPrimary href="/groups/{order.shopItem.group.uid}/shop/{order.shopItem.id}"
        >Voir</ButtonPrimary
      >
    </div>
  {/each}
</div>

<style>
  .content {
    display: flex;
    flex-flow: row wrap;
    gap: 1em;
    align-items: end;
    margin: 1em auto;
  }

  .item {
    display: flex;
    flex-direction: column;
    gap: 1em;
    align-items: center;
    padding: 1em;
    background: var(--muted-bg);
    border-radius: 1em;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    align-items: start;
  }

  .text-center {
    text-align: center;
  }

  .priceinfo {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
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
