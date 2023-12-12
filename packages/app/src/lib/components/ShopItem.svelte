<script lang="ts">
  import ShopImageCaroussel from '$lib/components/ShopImageCaroussel.svelte';

  type ShopItemType = {
    name: string;
    price: number;
    max: number;
    stock: number;
    stockLeft: number;
    description: string;
    id: string;
    group: {
      uid: string;
    };
  };

  export let shopItem: ShopItemType;
  const images = [
    'https://i.redd.it/megamind-no-bitches-meme-3264x3264-v0-gb5bw6safuu81.png?s=6ba867d0072d85550510802f10d38bb9f15ec0e7',
    'https://i.kym-cdn.com/entries/icons/original/000/037/984/thiccomniman.png',
  ];
</script>

<a class="container" href="./{shopItem.id}">
  <ShopImageCaroussel url={images} />
  <div class="info">
    <div class="data">
      <h1 class="name">{shopItem.name}</h1>
      {#if shopItem.stock !== 0}
        <p>{shopItem.stockLeft}/{shopItem.stock} restants</p>
      {/if}
      <p class="description">{shopItem.description}</p>
    </div>
    <div class="price">
      <h2>{shopItem.price} €</h2>
    </div>
  </div>
</a>

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

  .description {
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2; /* number of lines to show */
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .price {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 1em 0 0;
  }

  @media (width <= 350px) {
    .container {
      max-width: 15em;
    }

    .price {
      flex-direction: column;
    }
  }
</style>
