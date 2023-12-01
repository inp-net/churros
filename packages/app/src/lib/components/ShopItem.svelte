<script lang="ts">
  import ButtonPrimary from './ButtonPrimary.svelte';
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

<div class="container">
  <ShopImageCaroussel url={images} />
  <div class="info">
    <h1 class="name">{shopItem.name}</h1>
    <p>Max : {shopItem.max}</p>
    <p>Stock : {shopItem.stock}</p>
    <p>{shopItem.stockLeft} restants</p>
    <p>{shopItem.description}</p>
    <div class="price">
      <h2>Prix : {shopItem.price} €</h2>
      <ButtonPrimary smaller={true} href={`/groups/${shopItem.group.uid}/shop/${shopItem.id}`}
        >Commander</ButtonPrimary
      >
    </div>
  </div>
</div>

<style>
  .container {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    max-width: 20em;
    padding: 1em;
    background-color: var(--muted-bg);
    border-radius: 2em;
  }

  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0.5em 0 0;
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
