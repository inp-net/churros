<script lang="ts">
  import ButtonSecondary from './ButtonSecondary.svelte';
  import ButtonGhost from './ButtonGhost.svelte';
  import IconForward from '~icons/mdi/chevron-right';

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
        <th>Quantité</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each shopItems as shopItem (shopItem.id)}
        <tr>
          <td>{shopItem.name}</td>
          <td>{shopItem.stock}</td>
          <td class="actions">
            <ButtonSecondary href={`/groups/${shopItem.group.uid}/shop/${shopItem.id}/edit`}
              >Modifier</ButtonSecondary
            >
            <ButtonGhost href={`/groups/${shopItem.group.uid}/shop/sales/${shopItem.id}`}
              ><IconForward /></ButtonGhost
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
