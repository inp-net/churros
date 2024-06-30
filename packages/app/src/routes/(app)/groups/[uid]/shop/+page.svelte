<script lang="ts">
  import type { PageData } from './$types';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';
  import ShopItem from '$lib/components/ShopItem.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import IconAdd from '~icons/mdi/add';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import BackButton from '$lib/components/ButtonBack.svelte';
  export let data: PageData;

  const shopItems = data.itemsOfGroup.edges.flatMap(({ node }) => node);
  const group = data.group;

  const isOnClubBoard = Boolean(
    group.boardMembers.some((s) => s.member.uid === data.me?.uid || data.me?.admin),
  );

  let warningToastId: string;

  onMount(() => {
    warningToastId = toasts.warn('Page en bêta', 'Les boutiques sont en phase de test', {
      lifetime: Number.POSITIVE_INFINITY,
    })!;
  });

  onDestroy(async () => {
    await toasts.remove(warningToastId);
  });

  let tabs = [
    { name: 'Boutique', href: '.' },
    { name: 'Mes commandes', href: './orders/' },
  ];
  if (isOnClubBoard) {
    tabs = [
      { name: 'Boutique', href: '.' },
      { name: 'Mes commandes', href: './orders/' },
      { name: 'Gestion', href: './sales/' },
    ];
  }
</script>

<NavigationTabs {tabs} />

<div class="shop-header">
  <BackButton go="../." />
  <h1>Boutique de {group.name}</h1>
  <div>
    {#if isOnClubBoard}
      <ButtonSecondary href="./create/">
        Ajouter un article <IconAdd />
      </ButtonSecondary>
    {/if}
  </div>
</div>
<div class="content">
  {#if shopItems.length === 0}
    <p class="text-center">Aucun article</p>
  {/if}
  {#each shopItems as shopItem}
    <ShopItem {shopItem} small={false} />
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

  .shop-header {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 1rem 0;
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

    .shop-header {
      flex-direction: column;
      padding: 1rem 0;
      text-align: center;
    }
  }
</style>
