<script lang="ts">
  import AvatarPerson from './AvatarPerson.svelte';
  import { PAYMENT_METHODS_ICONS } from '$lib/display';
  import type { PaymentMethod } from '$lib/zeus';

  type shopPayments = Array<{
    id: string;
    paid: boolean;
    user: {
      fullName: string;
      pictureFile: string;
      uid: string;
    };
    paymentMethod: PaymentMethod;
    quantity: number;
    totalPrice: number;
  }>;
  export let payments: shopPayments;
</script>

<div class="content">
  <table>
    <thead>
      <tr>
        <th>Utilisateur</th>
        <th>Qté</th>
        <th>Prix total</th>
        <th>Payé ?</th>
        <th>Via</th>
      </tr>
    </thead>
    <tbody>
      {#each payments as payment}
        <tr>
          <td>
            <AvatarPerson
              fullName={payment.user.fullName}
              pictureFile={payment.user.pictureFile}
              href={`/users/${payment.user.uid}`}
              small={true}
            />
          </td>
          <td>x{payment.quantity}</td>
          <td>{payment.totalPrice} €</td>
          <td>{payment.paid ? 'Oui' : 'Non'}</td>
          <td class="payicon">
            <svelte:component
              this={PAYMENT_METHODS_ICONS[payment.paymentMethod ?? 'Other']}
              class="icon"
            />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  table {
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    overflow-y: scroll;
    border-spacing: 0.5rem;
    border-collapse: separate;
  }

  .payicon {
    min-width: 1rem;
    vertical-align: center;
  }
</style>
