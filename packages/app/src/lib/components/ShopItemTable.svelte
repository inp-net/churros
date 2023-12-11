<script lang="ts">
  import ButtonSecondary from './ButtonSecondary.svelte';
  import { goto } from '$app/navigation';

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
  export let shopItems: ShopItemType[];
</script>

<div class="container">
  <table>
    <thead>
      <tr>
        <th>Titre</th>
        <th>Restants</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each shopItems as shopItem (shopItem.id)}
        <tr on:click={goto(`/groups/${shopItem.group.uid}/shop/sales/${shopItem.id}`)}>
          <td>{shopItem.name}</td>
          <td>{shopItem.stockLeft}/{shopItem.stock}</td>
          <td class="actions">
            <ButtonSecondary href={`/groups/${shopItem.group.uid}/shop/${shopItem.id}/edit`}
              >Modifier</ButtonSecondary
            >
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  table {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    overflow-y: scroll;
    border-spacing: 0.25rem;
    border-collapse: separate;
  }

  table,
  th,
  td {
    border-color: var(--bg);
  }

  td,
  th {
    padding: 0.5rem;
    text-align: left;
  }

  td {
    background: var(--muted-bg);
  }

  .actions {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    background: var(--bg);
  }

  @media only screen and (width <= 400px) {
    table {
      width: 100%;
      border-spacing: var(--border-block);
    }

    td {
      font-size: 0.95em;
    }
  }
</style>
