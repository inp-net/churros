<script lang="ts">
  import IconCheck from '~icons/mdi/check';
  import IconPendingPayment from '~icons/mdi/cash-clock';
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { DISPLAY_PAYMENT_METHODS } from '$lib/display';
  import { PaymentMethod, zeus } from '$lib/zeus';
  import Alert from '$lib/components/Alert.svelte';
  import BackButton from '$lib/components/ButtonBack.svelte';
  import { page } from '$app/stores';
  import { dateTimeFormatter, formatDateTime } from '$lib/dates';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import { me } from '$lib/session';

  let done = false;
  $: done = $page.url.searchParams.has('done');
  let paying = false;
  let paymentLoading = false;
  let paid = false;
  $: paid = $page.url.searchParams.has('paid');
  let registrationId = '';

  const paymentDetails = { phone: $me?.phone ?? '' };

  let serverError = '';

  export let data: PageData;
  let beneficiary: string;
  let payingForThemself = true;
  const {
    id,
    allowedPaymentMethods,
    onlyManagersCanProvide,
    name,
    event: { contactMail, title, pictureFile, startsAt },
    price,
  } = data.ticketByUid;

  async function payBy(method: PaymentMethod | undefined) {
    const { upsertRegistration } = await $zeus.mutate({
      upsertRegistration: [
        {
          id: undefined,
          paid: price === 0,
          paymentMethod: method,
          beneficiary: payingForThemself ? '' : beneficiary,
          ticketId: id,
        },
        {
          __typename: true,
          '...on Error': {
            message: true,
          },
          '...on MutationUpsertRegistrationSuccess': {
            data: {
              id: true,
              paid: true,
            },
          },
        },
      ],
    });

    if (upsertRegistration.__typename === 'Error') {
      serverError = upsertRegistration.message;
      return;
    }

    serverError = '';

    // TODO handle actually going there only when payment has gone through
    if (method === PaymentMethod.Lydia) {
      registrationId = upsertRegistration.data.id;
      paying = true;
    } else {
      await goto(
        '?' +
          new URLSearchParams({
            done: upsertRegistration.data.id,
            ...(upsertRegistration.data.paid ? { paid: '' } : {}),
          }).toString()
      );
    }
  }
</script>

<section
  class="header"
  style:background-image="linear-gradient(#000000aa, #000000aa), url({pictureFile
    ? `${PUBLIC_STORAGE_URL}${pictureFile}`
    : 'https://picsum.photos/400/400'})"
>
  <h1>
    <BackButton go="../.." white />
    Paiement de ma place
  </h1>
  <p>
    {title}
    {#if name}&mdash; {name}{/if}
  </p>
</section>
<div class="content">
  {#if done}
    <div class="done">
      {#if paid}
        <div class="big-checkmark">
          <IconCheck />
        </div>
        <h1>C'est tout bon!</h1>
        <p>
          Ta place <strong>{name}</strong>
          pour l'évènement <strong>{title}</strong>
          du <strong>{dateTimeFormatter.format(startsAt)}</strong> est réservée
        </p>
        <ButtonPrimary href="/bookings/{$page.url.searchParams.get('done')}"
          >Mon billet</ButtonPrimary
        >
      {:else}
        <div class="big-checkmark">
          <IconPendingPayment />
        </div>
        <h1>Reste plus qu'à payer!</h1>
        <p>
          Ta place <strong>{name}</strong> pour l'évènement <strong>{title}</strong> du
          <strong>{formatDateTime(startsAt)}</strong> est en attente de paiement.
        </p>
      {/if}
    </div>
  {:else}
    <h2>Bénéficiaire</h2>
    <p>Tu peux payer pour quelqu'un d'autre</p>

    <section class="beneficiary">
      <InputCheckbox label="Je paie pour moi" bind:value={payingForThemself} />
      {#if !payingForThemself}
        <InputText label="Nom du bénéficiaire" bind:value={beneficiary} />
      {/if}
    </section>

    {#if onlyManagersCanProvide}
      <h2>Seul·e un·e manager peut te fournir cette place.</h2>
      <ButtonPrimary href="mailto:{contactMail}">Contacter un·e manager</ButtonPrimary>
    {:else if price <= 0}
      <h2>Cette place est gratuite! 🐀</h2>
      <ButtonPrimary on:click={async () => payBy(undefined)}>Réserver</ButtonPrimary>
    {:else}
      <h2>
        {#if paying}Paiement par Lydia{:else}Mode de paiement{/if}
      </h2>
      <p>Ta place n'est pas réservée tant que le paiement n'est pas terminé.</p>

      {#if !paying}
        <ul class="nobullet payment-methods">
          {#each allowedPaymentMethods as method}
            <li>
              <ButtonSecondary on:click={async () => payBy(method)}>
                {DISPLAY_PAYMENT_METHODS[method]}
              </ButtonSecondary>
            </li>
          {/each}
        </ul>
      {:else}
        <form
          class="pay"
          on:submit|preventDefault={async () => {
            paymentLoading = true;
            const { paidRegistration } = await $zeus.mutate({
              paidRegistration: [
                {
                  regId: registrationId,
                  phone: paymentDetails.phone,
                  beneficiary,
                  paymentMethod: PaymentMethod.Lydia,
                },
                {
                  __typename: true,
                  '...on Error': { message: true },
                  '...on MutationPaidRegistrationSuccess': {
                    data: {
                      __typename: true,
                    },
                  },
                },
              ],
            });
            if (paidRegistration.__typename === 'Error') serverError = paidRegistration.message;
            else
              await goto('?' + new URLSearchParams({ done: registrationId, paid: '' }).toString());
          }}
        >
          <InputText
            type="tel"
            label="Numéro de téléphone"
            initial={$me?.phone}
            bind:value={paymentDetails.phone}
          />
          <section class="submit">
            <ButtonPrimary loading={paymentLoading} submits>Payer {price}€</ButtonPrimary>
          </section>
        </form>
      {/if}
    {/if}

    {#if serverError}
      <Alert theme="danger">Impossible de réserver cette place: {serverError}</Alert>
    {/if}
  {/if}

  <h2>Un soucis?</h2>
  <p>Tu peux contacter les organisateur·ice·s de cet évènement.</p>

  <ButtonSecondary href="mailto:{contactMail}">{contactMail}</ButtonSecondary>
</div>

<style lang="scss">
  .header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background-size: cover;

    > * {
      margin: 0;
      color: white;
    }
  }

  .big-checkmark {
    margin: 4rem 0;
    font-size: 6rem;
  }

  .done {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
    justify-content: center;

    p {
      margin: 0 1.5rem;
      text-align: justify;
    }
  }

  .content {
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    justify-content: center;
    padding: 0 1rem;

    h2 {
      margin-top: 2rem;
    }
  }

  .payment-methods {
    display: flex;
    flex-flow: row wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .beneficiary {
    display: flex;
    flex-flow: column wrap;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    margin-top: 0.5rem;
  }

  form.pay {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: center;
  }
</style>
