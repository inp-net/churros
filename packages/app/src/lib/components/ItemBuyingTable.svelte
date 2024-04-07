<script lang="ts">
  import { PAYMENT_METHODS_ICONS } from '$lib/display';
  import type { PaymentMethod } from '$lib/zeus';
  import AvatarPerson from './AvatarPerson.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import { zeus } from '$lib/zeus';
  import { toasts } from '$lib/toasts';
  import IconCash from '~icons/mdi/currency-usd';
  import IconCashOff from '~icons/mdi/currency-usd-off';

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
    shopItemAnswer: { options: Array<string> };
  }>;

  type shopItemOptions = Array<{
    name: string;
    options: Array<string>;
  }>;

  export let options: shopItemOptions;

  export let payments: shopPayments;

  async function updatePaidStatus(paymentId: string) {
    const { paidShopPayment } = await $zeus.mutate({
      paidShopPayment: [
        {
          shopPaymentId: paymentId,
        },
        {
          '__typename': true,
          '...on MutationPaidShopPaymentSuccess': {
            data: {
              paid: true,
            },
          },
          '...on Error': {
            message: true,
          },
        },
      ],
    });
    if (paidShopPayment.__typename === 'MutationPaidShopPaymentSuccess')
      toasts.add('success', 'Le paiement a bien été actualisé');
    else toasts.add('error', "Erreur lors de l'actualisation du paiement");
  }
</script>

<div class="table-scroller">
  <table>
    <thead>
      <tr>
        <th>User</th>
        <th>Quantité</th>
        <th>Prix total</th>
        {#each options as option}
          <th>{option.name}</th>
        {/each}
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
          {#each payment.shopItemAnswer.options as option}
            <td>{option}</td>
          {/each}
          <td>{payment.paid ? 'Oui' : 'Non'}</td>
          <td class="payicon">
            <svelte:component
              this={PAYMENT_METHODS_ICONS[payment.paymentMethod ?? 'Other']}
              class="icon"
            />
          </td>
          <td class="actions">
            <ButtonGhost
              danger={payment.paid}
              success={!payment.paid}
              help={'Marquer comme ' + (payment.paid ? 'non payée' : 'payée')}
              on:click={async () => updatePaidStatus(payment.id)}
            >
              {#if payment.paid}
                <IconCashOff />
              {:else}
                <IconCash />
              {/if}
            </ButtonGhost>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .payicon {
    min-width: 1rem;
    vertical-align: center;
  }

  .table-scroller {
    overflow-x: auto;
  }

  table {
    --spacing: 0.5rem;

    max-width: 100vw;
    margin: 0 auto;
    overflow-y: scroll;
    border-spacing: calc(max(0.5rem, var(--spacing) / 2));
    border-collapse: separate;
  }

  table,
  th,
  td {
    border-color: var(--bg);
  }

  td,
  th {
    padding: calc(max(0.5rem, var(--spacing) / 2));
    text-align: left;
  }

  th {
    padding-top: 0;
    padding-bottom: 0;
  }

  td {
    background: var(--muted-bg);
    border-radius: var(--radius-inline);
  }

  td.actions {
    width: max-content;
    padding: 0.25rem 1rem;
    background: transparent;
  }
</style>
