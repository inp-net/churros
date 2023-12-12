<script lang="ts">
  import type { PageData } from './$types';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import ShopImageCaroussel from '$lib/components/ShopImageCaroussel.svelte';

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
      <ShopImageCaroussel
        url={[
          'https://i.redd.it/megamind-no-bitches-meme-3264x3264-v0-gb5bw6safuu81.png?s=6ba867d0072d85550510802f10d38bb9f15ec0e7',
          'https://i.kym-cdn.com/entries/icons/original/000/037/984/thiccomniman.png',
        ]}
      />
      <h2>{order.shopItem.name}</h2>
      <p>{order.paid}</p>
      <p>{order.totalPrice} €</p>
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
    margin: 0 auto;
  }

  .text-center {
    text-align: center;
  }

  @media only screen and (width > 900px) and (width < 990px) {
    .content {
      justify-content: center;
    }
  }

  @media only screen and (width <= 690px) {
    .content {
      justify-content: center;
    }
  }
</style>
