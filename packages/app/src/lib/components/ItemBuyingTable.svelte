<script lang="ts">
  import AvatarPerson from './AvatarPerson.svelte';
  import { PAYMENT_METHODS_ICONS } from '$lib/display';

  type shopPayments = Array<{
    id: string;
    paid: boolean;
    user: {
      fullName: string;
      pictureFile: string;
      uid: string;
    };
    paymentMethod: string;
    quantity: number;
    totalPrice: number;
  }>;
  export let payments: shopPayments;
</script>

<div class="content">
  <table>
    <tbody>
      {#each payments as payment}
        <tr>
          <td
            ><AvatarPerson
              fullName={payment.user.fullName}
              pictureFile={payment.user.pictureFile}
              href={`/users/${payment.user.uid}`}
            /></td
          >
          <td>x{payment.quantity}</td>
          <td>{payment.totalPrice} €</td>
          <td class="payicon"
            ><svelte:component
              this={PAYMENT_METHODS_ICONS[payment.paymentMethod ?? 'Other']}
              class="icon"
            /></td
          >
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
    border-spacing: 1rem;
    border-collapse: separate;
  }

  .payicon {
    min-width: 1rem;
    vertical-align: center;
  }
</style>
