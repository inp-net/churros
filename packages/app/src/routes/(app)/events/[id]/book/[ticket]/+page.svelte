<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Alert from '$lib/components/Alert.svelte';
  import AreaPaypalPayRegistration from '$lib/components/AreaPaypalPayRegistration.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import { dateTimeFormatter, formatDate, formatDateTime } from '$lib/dates';
  import { DISPLAY_PAYMENT_METHODS, PAYMENT_METHODS_ICONS } from '$lib/display';
  import { me } from '$lib/session';
  import { EventFrequency, PaymentMethod, zeus } from '$lib/zeus';
  import IconPendingPayment from '~icons/mdi/cash-clock';
  import IconCheck from '~icons/mdi/check';
  import Header from '../../Header.svelte';
  import type { PageData } from './$types';
  import { subscribe } from '$lib/subscriptions';

  let done = false;
  $: done = $page.url.searchParams.has('done');
  let paying = false;
  let chosenPaymentMethod = PaymentMethod.Other;
  let paymentLoading = false;
  let choosingPaymentMethodLoading: PaymentMethod | undefined = undefined;
  let paid = false;
  $: paid = $page.url.searchParams.has('paid');
  let registrationId = '';
  let registration:
    | undefined
    | { id: string; paid: boolean; paymentMethod?: PaymentMethod | undefined } = undefined;

  const paymentDetails = { phone: $me?.phone ?? '' };

  let serverError = '';

  export let data: PageData;
  let beneficiary: string;
  let authorEmail = '';
  let payingForThemself = true;
  const { id, allowedPaymentMethods, onlyManagersCanProvide, name, links, price } =
    data.event.ticket!;

  const { contactMail, title, pictureFile, startsAt, managers } = data.event;

  let { remainingGodsons } = data.event.ticket!;
  $: remainingGodsons = remainingGodsons === -1 ? Number.POSITIVE_INFINITY : remainingGodsons;

  async function payBy(method: PaymentMethod | undefined) {
    choosingPaymentMethodLoading = method ?? PaymentMethod.Other;
    const { upsertRegistration } = await $zeus.mutate({
      upsertRegistration: [
        {
          id: undefined,
          paid: price === 0,
          paymentMethod: method,
          beneficiary: payingForThemself ? '' : beneficiary,
          ticketId: id,
          authorEmail,
        },
        {
          '__typename': true,
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
    choosingPaymentMethodLoading = undefined;

    if (upsertRegistration.__typename === 'Error') {
      serverError = upsertRegistration.message;
      return;
    }

    serverError = '';

    // TODO handle actually going there only when payment has gone through
    if (method === PaymentMethod.Lydia || method === PaymentMethod.PayPal) {
      registrationId = upsertRegistration.data.id;
      paying = true;
      chosenPaymentMethod = method;
    } else {
      await goto(
        '?' +
          new URLSearchParams({
            done: upsertRegistration.data.id,
            ...(upsertRegistration.data.paid ? { paid: '' } : {}),
          }).toString(),
      );
    }
  }

  async function redirectIfPaid() {
    const registrationId = $page.url.searchParams.get('done')?.toLowerCase();
    if (!registrationId) return;
    const result = await $zeus.query({
      registration: [
        {
          id: registrationId,
        },
        {
          '__typename': true,
          '...on QueryRegistrationSuccess': { data: { paid: true, paymentMethod: true, id: true } },
          '...on Error': { message: true },
        },
      ],
    });
    if (result.registration.__typename === 'QueryRegistrationSuccess') {
      registration = result.registration.data;
      if (registration?.paid) await goto(`/bookings/${registration.id}`);
      if (registration) {
        $subscribe(
          {
            registration: [
              { id: registration.id },
              {
                '__typename': true,
                '...on Error': { message: true },
                '...on SubscriptionRegistrationSuccess': {
                  data: {
                    paid: true,
                    code: true,
                  },
                },
              },
            ],
          },
          async (result) => {
            const freshData = await result;
            if ('errors' in freshData) return;
            if (freshData.registration.__typename !== 'SubscriptionRegistrationSuccess') return;
            const { paid, code } = freshData.registration.data as { paid: boolean; code: string };
            if (paid) await goto(`/bookings/${code}`);
          },
        );
      }
    }
  }
</script>

<Header
  {pictureFile}
  frequency={EventFrequency.Once}
  title="Réservation d'une place {name}"
  subtitle="Pour l'évènement {title} du {formatDate(startsAt)}"
/>

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
      {#await redirectIfPaid() then}
        {#if links.length > 0}
          <section class="links">
            <p>En attendant:</p>
            <ul class="links nobullet">
              {#each links as link}
                <li>
                  <ButtonSecondary href={link.computedValue}>{link.name}</ButtonSecondary>
                </li>
              {/each}
            </ul>
          </section>
        {/if}

        {#if registration?.paymentMethod === PaymentMethod.Lydia}
          <p>Rends-toi sur ton application Lydia pour régler le paiement.</p>
          <ButtonPrimary track="booking-done" href="/bookings/{$page.url.searchParams.get('done')}"
            >C'est payé!</ButtonPrimary
          >
        {:else}
          <ButtonPrimary track="booking-done" href="/bookings/{$page.url.searchParams.get('done')}"
            >Mon billet</ButtonPrimary
          >
        {/if}
      {/await}
    </div>
  {:else}
    {#if !$me}
      <InputText type="email" bind:value={authorEmail} label="Ton adresse e-mail"></InputText>
    {/if}

    {#if remainingGodsons > 0}
      <h2>Bénéficiaire</h2>
      <p>
        Tu peux payer pour quelqu'un d'autre. {#if remainingGodsons <= 100}Il te reste {remainingGodsons}
          parrainages.{/if}
      </p>

      <section class="beneficiary">
        <InputCheckbox label="Je paie pour moi" bind:value={payingForThemself} />
        {#if !payingForThemself}
          <InputText
            hint="Si tu paies pour quelqu'un qui a un compte Churros, mets son @"
            label="Nom du bénéficiaire"
            maxlength={255}
            bind:value={beneficiary}
          />
        {/if}
      </section>
    {/if}

    {#if onlyManagersCanProvide && !managers?.some((m) => m.user.uid === $me?.uid)}
      <h2>Seul·e un·e manager peut te fournir cette place.</h2>
      <ButtonPrimary href="mailto:{contactMail}">Contacter un·e manager</ButtonPrimary>
    {:else if price <= 0}
      <h2>Cette place est gratuite! 🐀</h2>
      <ButtonPrimary on:click={async () => payBy(undefined)}>Réserver</ButtonPrimary>
    {:else}
      <h2>
        {#if paying}Paiement par {DISPLAY_PAYMENT_METHODS[chosenPaymentMethod]}{:else}Mode de
          paiement{/if}
      </h2>
      <!-- <p>Ta place n'est pas réservée tant que le paiement n'est pas terminé.</p> -->

      {#if !paying}
        <ul class="nobullet payment-methods">
          {#each allowedPaymentMethods as method}
            <li>
              <ButtonSecondary
                track="booking-choose-payment-method"
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
      {:else if chosenPaymentMethod === PaymentMethod.Lydia}
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
                  '__typename': true,
                  '...on Error': { message: true },
                  '...on MutationPaidRegistrationSuccess': {
                    data: true,
                  },
                },
              ],
            });
            if (paidRegistration.__typename === 'Error') serverError = paidRegistration.message;
            else await goto('?' + new URLSearchParams({ done: registrationId }).toString());
          }}
        >
          <InputText
            type="tel"
            label="Numéro de téléphone"
            initial={$me?.phone}
            maxlength={255}
            bind:value={paymentDetails.phone}
          />
          <section class="submit">
            <ButtonPrimary track="pay-by-lydia" loading={paymentLoading} submits
              >Payer {price}€</ButtonPrimary
            >
          </section>
        </form>
      {:else if chosenPaymentMethod === PaymentMethod.PayPal}
        <AreaPaypalPayRegistration bind:paymentLoading {beneficiary} {registrationId}
        ></AreaPaypalPayRegistration>
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
      margin-top: 1rem;
      margin-bottom: 1rem;
    }
  }

  .payment-methods {
    display: flex;
    flex-flow: row wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .no-payment-methods {
    padding: 1rem;
    color: var(--text);
    background: var(--bg);
    border-radius: var(--radius-block);
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
