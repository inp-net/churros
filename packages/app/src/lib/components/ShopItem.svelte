<script lang="ts">
  import ShopImageCaroussel from '$lib/components/ShopImageCaroussel.svelte';

  type ShopItemType = {
    uid: string;
    name: string;
    price: number;
    max: number;
    stock: number;
    stockLeft: number;
    descriptionHtml: unknown;
    id: string;
    group: {
      uid: string;
    };
    pictures: Array<{
      path: string;
    }>;
  };

  export let small = false;
  export let shopItem: ShopItemType;
</script>

<div class="container" class:small>
  <ShopImageCaroussel {small} url={shopItem.pictures.map((p) => p.path)} />
  <a class="info" href="/groups/{shopItem.group.uid}/shop/{shopItem.uid}/">
    <div class="data">
      <h1 class="name" class:small>{shopItem.name}</h1>
      {#if shopItem.stock !== 0 && !small}
        <p>{shopItem.stockLeft}/{shopItem.stock} restants</p>
      {/if}
      {#if !small}
        <div data-user-html class="item-description typo-details">
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html shopItem.descriptionHtml}
        </div>
      {/if}
    </div>

    <div class="price">
      <h2>{shopItem.price} €</h2>
    </div>
  </a>
</div>

<style>
  .container {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    flex-grow: 1;
    width: 18em;
    max-width: 18em;
    height: auto;
    overflow: hidden;
    background-color: var(--muted-bg);
    border-radius: 14px;
  }

  .container.small {
    width: 13em;
    max-width: 13em;
    font-size: 0.7em;
  }

  .container:hover {
    background: var(--hover-bg);
  }

  .info {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    justify-content: space-between;
    padding: 1em;
  }

  .data {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .item-description {
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2; /* number of lines to show */
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .name.small {
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2; /* number of lines to show */
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .price {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 1em 0 0;
  }

  @media (max-width: 350px) {
    .container {
      max-width: 15em;
    }
  }
</style>
