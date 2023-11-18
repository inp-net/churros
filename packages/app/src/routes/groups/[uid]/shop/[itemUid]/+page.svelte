<script lang="ts">
  import type { PageData } from './$types';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { DISPLAY_PAYMENT_METHODS, PAYMENT_METHODS_ICONS } from '$lib/display';
  import { PaymentMethod, zeus } from '$lib/zeus';
  import { me } from '$lib/session';
  import { goto } from '$app/navigation';
  import InputText from '$lib/components/InputText.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';

  export let data: PageData;

  const { shopItem } = data;

  let warningToastId: string;
  let serverError = '';
  let paying = false;
  let paymentLoading = false;
  let shopPaymentId = '';
  let phone = '';
  let choosingPaymentMethodLoading: PaymentMethod | undefined = undefined;

  let quantity = 1;
  let max = Math.min(shopItem.max, shopItem.stock);

  async function payBy(method: PaymentMethod | undefined) {
    if ($me?.uid === undefined) {
      await goto('/login');
    }
    choosingPaymentMethodLoading = method ?? PaymentMethod.Other;
    const { upsertShopPayment } = await $zeus.mutate({
      upsertShopPayment: [
        {
          id: undefined,
          paymentMethod: method,
          userUid: $me?.uid ?? '',
          shopItemId: shopItem.id,
          quantity,
        },
        {
          __typename: true,
          '...on Error': {
            message: true,
          },
          '...on MutationUpsertShopPaymentSuccess': {
            data: {
              id: true,
              paid: true,
            },
          },
        },
      ],
    });
    choosingPaymentMethodLoading = undefined;

    if (upsertShopPayment.__typename === 'Error') {
      serverError = upsertShopPayment.message;
      return;
    }

    serverError = '';

    // TODO handle actually going there only when payment has gone through
    if (method === PaymentMethod.Lydia) {
      shopPaymentId = upsertShopPayment.data.id;
      paying = true;
    } else {
      await goto(
        '?' +
          new URLSearchParams({
            done: upsertShopPayment.data.id,
            ...(upsertShopPayment.data.paid ? { paid: '' } : {}),
          }).toString(),
      );
    }
  }

  onMount(() => {
    warningToastId = toasts.warn('Page en bêta', 'Les boutiques sont en cours de fonctionnement', {
      lifetime: Number.POSITIVE_INFINITY,
    });
  });

  onDestroy(async () => {
    await toasts.remove(warningToastId);
  });
</script>

<div class="content">
  <h2>{shopItem.name}</h2>
  <p>{shopItem.stock}*{shopItem.price} €</p>
  <p>max: {shopItem.max}</p>
  <p>{shopItem.description}</p>
  <input type="number" bind:value={quantity} min="1" {max} />

  <ul class="nobullet payment-methods">
    {#if !paying}
      <ul class="nobullet payment-methods">
        {#each shopItem.paymentMethods as method}
          <li>
            <ButtonSecondary
              loading={choosingPaymentMethodLoading === method}
              disabled={Boolean(choosingPaymentMethodLoading)}
              icon={PAYMENT_METHODS_ICONS[method]}
              on:click={async () => payBy(method)}
            >
              {DISPLAY_PAYMENT_METHODS[method]}
            </ButtonSecondary>
          </li>
        {:else}
          <li class="no-payment-methods danger">
            Aucun moyen de paiement disponible. Contactez les managers de l'évènement.
          </li>
        {/each}
      </ul>
    {:else}
      <form
        class="pay"
        on:submit|preventDefault={async () => {
          paymentLoading = true;
          const { paidShopPayment } = await $zeus.mutate({
            paidShopPayment: [
              {
                shopPaymentId: shopPaymentId,
                phone: phone,
                paymentMethod: PaymentMethod.Lydia,
              },
              {
                __typename: true,
                '...on Error': { message: true },
                '...on MutationPaidShopPaymentSuccess': {
                  data: {
                    __typename: true,
                  },
                },
              },
            ],
          });
          if (paidShopPayment.__typename === 'Error') serverError = paidShopPayment.message;
          else await goto('?' + new URLSearchParams({ done: shopPaymentId }).toString());
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
          <ButtonPrimary loading={paymentLoading} submits
            >Payer {quantity * shopItem.price}€</ButtonPrimary
          >
        </section>
      </form>
    {/if}
  </ul>
</div>
