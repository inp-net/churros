<script lang="ts">
  import { goto } from '$app/navigation';
  import { zeus } from '$lib/zeus';
  import { toasts } from '$lib/toasts';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ShopImageCaroussel from '$lib/components/ShopImageCaroussel.svelte';
  import BadgePaymentStatus from '$lib/components/BadgePaymentStatus.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import { ICONS_PAYMENT_METHODS } from '$lib/display';
  import { me } from '$lib/session';
  import { PaymentMethod } from '$lib/zeus';

  export let order: {
    id: string;
    shopItem: {
      name: string;
      pictures: { path: string }[];
    };
    totalPrice: number;
    paid: boolean;
    paymentMethod: PaymentMethod | null;
  };

  let paying = false;
  let paymentLoading = false;
  let phone = '';
</script>

<div class="item">
  <ShopImageCaroussel url={order.shopItem.pictures.map((p) => p.path)} />
  <div class="info">
    <h2>{order.shopItem.name}</h2>
    <div class="priceinfo">
      <p>{order.totalPrice} €</p>
      <svelte:component this={ICONS_PAYMENT_METHODS[order.paymentMethod ?? 'Other']} class="icon" />
      <p><BadgePaymentStatus paid={order.paid} opposed={false} cancelled={false} /></p>
    </div>
  </div>
  {#if !paying && !order.paid && order.paymentMethod === 'Lydia'}
    <div class="footer">
      <ButtonPrimary
        on:click={() => {
          paying = true;
        }}>Payer</ButtonPrimary
      >
    </div>
  {/if}
  {#if paying}
    <form
      class="pay"
      on:submit|preventDefault={async () => {
        paymentLoading = true;
        const { paidShopPayment } = await $zeus.mutate({
          paidShopPayment: [
            {
              shopPaymentId: order.id,
              phone,
              paymentMethod: PaymentMethod.Lydia,
            },
            {
              '__typename': true,
              '...on Error': { message: true },
              '...on MutationPaidShopPaymentSuccess': {
                data: {
                  __typename: true,
                },
              },
            },
          ],
        });
        if (paidShopPayment.__typename === 'Error') {
          const serverError = paidShopPayment.message;
          paymentLoading = false;
          toasts.add('error', serverError);
          return;
        } else {
          await goto('?' + new URLSearchParams({ done: order.id }).toString());
          paymentLoading = false;
          toasts.add('success', 'La demande de paiement a été envoyée');
        }
      }}
    >
      <InputText
        type="tel"
        label="Numéro de téléphone"
        initial={$me?.phone}
        maxlength={255}
        bind:value={phone}
      />

      <section class="submit">
        <ButtonPrimary loading={paymentLoading} submits>Payer {order.totalPrice}€</ButtonPrimary>
      </section>
    </form>
  {/if}
</div>

<style>
  .item {
    display: flex;
    flex-direction: column;
    gap: 1em;
    align-items: center;
    width: 18em;
    max-width: 18em;
    padding: 1em;
    background: var(--muted-bg);
    border-radius: 1em;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    align-items: start;
    min-width: 200px;
  }

  .priceinfo {
    display: flex;
    flex-direction: row;
    gap: 1em;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .footer {
    display: flex;
    gap: 1em;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1em;
    align-items: center;
    width: 100%;
  }
</style>
