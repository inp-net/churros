<script lang="ts">
  import type { PageData } from './$types';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import ShopImageCaroussel from '$lib/components/ShopImageCaroussel.svelte';
  import BadgePaymentStatus from '$lib/components/BadgePaymentStatus.svelte';
  import BackButton from '$lib/components/ButtonBack.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import { PAYMENT_METHODS_ICONS } from '$lib/display';
  import { me } from '$lib/session';
  import { goto } from '$app/navigation';
  import { PaymentMethod, zeus } from '$lib/zeus';

  export let data: PageData;

  const { orders } = data;

  let warningToastId: string;
  let paying = false;
  let paymentLoading = false;
  let phone = '';

  onMount(() => {
    warningToastId = toasts.warn('Page en bêta', 'Les boutiques sont en phase de test', {
      lifetime: Number.POSITIVE_INFINITY,
    });
  });

  onDestroy(async () => {
    await toasts.remove(warningToastId);
  });
</script>

<NavigationTabs
  tabs={[
    { name: 'Boutique', href: '../' },
    { name: 'Mes commandes', href: '.' },
  ]}
/>
<div class="header">
  <BackButton go="../.." />
  <h1>Mes achats</h1>
</div>
<div class="content">
  {#if orders.length === 0}
    <p class="text-center">Aucun article</p>
  {/if}
  {#each orders as order}
    <div class="item">
      <ShopImageCaroussel url={order.shopItem.pictures.map((p) => p.path)} />
      <div class="info">
        <h2>{order.shopItem.name}</h2>
        <div class="priceinfo">
          <p>{order.totalPrice} €</p>
          <svelte:component
            this={PAYMENT_METHODS_ICONS[order.paymentMethod ?? 'Other']}
            class="icon"
          />
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
            <ButtonPrimary loading={paymentLoading} submits>Payer {order.totalPrice}€</ButtonPrimary
            >
          </section>
        </form>
      {/if}
    </div>
  {/each}
</div>

<style>
  .header {
    display: flex;
    gap: 1em;
    align-items: center;
    margin: 1em auto;
  }

  .content {
    display: flex;
    flex-flow: row wrap;
    gap: 1em;
    align-items: stretch;
    margin: 1em auto;
  }

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

  .text-center {
    text-align: center;
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

  @media only screen and (min-width: 900px) and (max-width: 990px) {
    .content {
      justify-content: center;
    }
  }

  @media only screen and (max-width: 690px) {
    .content {
      justify-content: center;
    }
  }
</style>
