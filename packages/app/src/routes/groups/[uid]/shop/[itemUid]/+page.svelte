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
  import ShopImageCaroussel from '$lib/components/ShopImageCaroussel.svelte';

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
  let max = Math.min(shopItem.max, shopItem.stockLeft);

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

  $: quantityString = quantity.toString();
</script>

<div class="content">
  <div class="twocolcontainer">
    <div class="namepic">
      <div class="left">
        <ShopImageCaroussel {...shopItem} url={['https://i.redd.it/megamind-no-bitches-meme-3264x3264-v0-gb5bw6safuu81.png?s=6ba867d0072d85550510802f10d38bb9f15ec0e7','https://i.kym-cdn.com/entries/icons/original/000/037/984/thiccomniman.png']}/>
      </div>
      <div class="mid">
        <h2>{shopItem.name}</h2>
        <p>{shopItem.description}</p>
      </div>
    </div>
    <div class="right">
      <h2>Acheter</h2>
      <p>Stock: {shopItem.stock}</p>
      <p>Restant: {shopItem.stockLeft}</p>
      <p>Price: {shopItem.price} €</p>
      <InputText type="number" bind:value={quantityString} min="1" {max} label="Quantité" on:change={() => {quantity = parseInt(quantityString)}}/>

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
</div>

</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .twocolcontainer {
    display: flex;
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .namepic {
    display: flex;
    flex-direction: row;
    align-items: start;
    justify-content: space-evenly;
    width : 100%;
  }
  .left {
    min-width:300px;
    
  }

  .mid {
    padding:1em;
  }
  .right {
    width : 400px;
    background-color: var(--muted-bg);
    padding: 1em;
    border-radius: 10px;
  }

  .payment-methods {
    margin-top: 0.5em;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 1em;
  }

  @media only screen and (max-width: 1100px) {
    .twocolcontainer {
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .namepic {
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap:2em;
    }
    .left {
      width : 100%;
    }
  }
</style>