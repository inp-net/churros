<script lang="ts">
  import { goto } from '$app/navigation';
  import BackButton from '$lib/components/ButtonBack.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import InputNumber from '$lib/components/InputNumber.svelte';
  import InputSelectOneDropdown from '$lib/components/InputSelectOneDropdown.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import ShopImageCaroussel from '$lib/components/ShopImageCaroussel.svelte';
  import { DISPLAY_PAYMENT_METHODS, ICONS_PAYMENT_METHODS } from '$lib/display';
  import { me } from '$lib/session';
  import { toasts } from '$lib/toasts';
  import { PaymentMethod, zeus } from '$lib/zeus';
  import { onDestroy, onMount } from 'svelte';
  import IconEdit from '~icons/mdi/pencil';
  import type { PageData } from './$types';
  import { refroute } from '$lib/navigation';

  export let data: PageData;

  const { group } = data;
  const shopItem = group.shopItem!;

  let warningToastId: string;
  // ESlint ne sais pas que serverError est utilisé
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let serverError;
  let paying = false;
  let paymentLoading = false;
  let shopPaymentId = '';
  let phone = '';
  let choosingPaymentMethodLoading: PaymentMethod | undefined = undefined;
  const answers: string[] = [];
  const dropdown: string[] = [];
  let quantity = 1;
  const max = Math.min(shopItem.max, shopItem.stockLeft);

  for (const _ of shopItem.itemOptions) {
    dropdown.push('');
    answers.push('');
  }

  async function payBy(method: PaymentMethod | undefined) {
    if ($me?.uid === undefined) await goto(refroute('/login') + '&why=unauthorized');
    choosingPaymentMethodLoading = method ?? PaymentMethod.Other;
    const { upsertShopPayment } = await $zeus.mutate({
      upsertShopPayment: [
        {
          id: undefined,
          paymentMethod: method,
          userUid: $me?.uid ?? '',
          shopItemId: shopItem.id,
          quantity,
          answers,
        },
        {
          '__typename': true,
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

    if (upsertShopPayment.__typename === 'Error') {
      choosingPaymentMethodLoading = undefined;
      serverError = upsertShopPayment.message;

      toasts.error('Erreur', serverError, { lifetime: 5000, showLifetime: true });
      return;
    }

    serverError = '';
    if (method === PaymentMethod.Lydia) paying = true;
    // TODO handle actually going there only when payment has gone through
    if (upsertShopPayment.__typename === 'MutationUpsertShopPaymentSuccess') {
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
        paying = false;
      }
    }
    if (upsertShopPayment.__typename === 'MutationUpsertShopPaymentSuccess' && !paying)
      await goto('../orders/');
  }

  onMount(() => {
    warningToastId = toasts.warn('Page en bêta', 'Les boutiques sont en phase de test', {
      lifetime: Number.POSITIVE_INFINITY,
    })!;
  });

  onDestroy(async () => {
    await toasts.remove(warningToastId);
  });
</script>

<div class="content">
  <div class="twocolcontainer">
    <div class="namepic">
      <div class="left">
        <ShopImageCaroussel url={shopItem.pictures.map((p) => p.path)} />
      </div>
      <div class="mid">
        <div class="name-header">
          <BackButton go="../." />
          <h2>{shopItem.name}</h2>
          <ButtonShare />
          {#if $me?.admin || group.boardMembers.find((m) => m.member.uid === $me?.uid)}
            <ButtonGhost href="./edit/"><IconEdit /></ButtonGhost>
          {/if}
        </div>
        <div data-user-html class="item-description typo-details">
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html shopItem.descriptionHtml}
        </div>
      </div>
    </div>
    <div class="right">
      <h2>Acheter</h2>
      <p>Stock: {shopItem.stock === 0 ? '+∞' : shopItem.stock}</p>
      <p>Restant: {shopItem.stock === 0 ? '+∞' : shopItem.stockLeft}</p>
      <p>Prix: {shopItem.price} €</p>
      <InputNumber
        bind:value={quantity}
        label="Quantité"
        on:change={() => {
          if (quantity < 0) quantity = 0;
          if (quantity > max) quantity = max;
        }}
      />

      {#if shopItem.itemOptions.length > 0}
        <div class="options">
          {#each shopItem.itemOptions as option, i}
            <InputSelectOneDropdown
              label={option.name}
              options={option.options}
              bind:value={dropdown[i]}
              required={option.required}
              other={option.otherToggle}
              on:input={() => {
                if (dropdown[i] !== 'Autre') answers[i] = dropdown[i];
              }}
            />
            {#if dropdown[i] === 'Autre'}
              <InputText label={'Autre'} bind:value={answers[i]} required={option.required} />
            {/if}
          {/each}
        </div>
      {/if}
      <ul class="nobullet payment-methods">
        {#if !paying}
          <ul class="nobullet payment-methods">
            {#each shopItem.paymentMethods as method}
              <li>
                <ButtonSecondary
                  loading={choosingPaymentMethodLoading === method}
                  disabled={Boolean(choosingPaymentMethodLoading)}
                  icon={ICONS_PAYMENT_METHODS[method]}
                  on:click={async () => payBy(method)}
                >
                  {DISPLAY_PAYMENT_METHODS[method]}
                </ButtonSecondary>
              </li>
            {:else}
              <li class="no-payment-methods danger">
                Aucun moyen de paiement disponible. Contactez le bureau de {group.name}.
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
                    shopPaymentId,
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
                serverError = paidShopPayment.message;
                paymentLoading = false;
                return;
              } else {
                await goto('../orders/');
                paymentLoading = false;
                toasts.add('success', 'La demande de paiement a été envoyée');
              }
            }}
          >
            {#if choosingPaymentMethodLoading === PaymentMethod.Lydia}
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
            {/if}
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
    max-width: 800px;
    margin: 0 auto;
  }

  .twocolcontainer {
    display: flex;
    flex-direction: row;
    gap: 1em;
    align-items: start;
    justify-content: space-between;
    width: 100%;
    padding: 1em;
  }

  .namepic {
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: space-evenly;
    width: 100%;
  }

  .left {
    width: 400px;
    object-fit: contain;
  }

  .mid {
    max-width: 450px;
    margin: 1em 0;
  }

  .right {
    width: 500px;
    padding: 1em;
    background-color: var(--muted-bg);
    border-radius: 10px;
  }

  .payment-methods {
    display: flex;
    flex-flow: row wrap;
    gap: 1em;
    align-items: center;
    justify-content: center;
    margin-top: 0.5em;
  }

  .name-header {
    display: flex;
    gap: 1em;
    align-items: center;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1em;
    align-items: center;
    width: 100%;
  }

  @media only screen and (max-width: 1100px) {
    .twocolcontainer {
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .namepic {
      flex-direction: column;
      gap: 2em;
      align-items: center;
      justify-content: center;
    }

    .left {
      min-width: 200px;
    }
  }
</style>
