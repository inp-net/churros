<script lang="ts">
  import { goto } from '$app/navigation';
  import { track } from '$lib/analytics';
  import Alert from '$lib/components/Alert.svelte';
  import AreaPaypalPayRegistration from '$lib/components/AreaPaypalPayRegistration.svelte';
  import BadgePaymentStatus from '$lib/components/BadgePaymentStatus.svelte';
  import ButtonAddToGoogleWallet from '$lib/components/ButtonAddToGoogleWallet.svelte';
  import BackButton from '$lib/components/ButtonBack.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import { dateTimeFormatter, formatDateTime } from '$lib/dates';
  import { DISPLAY_PAYMENT_METHODS } from '$lib/display';
  import { refroute } from '$lib/navigation';
  import { me } from '$lib/session';
  import { subscribe } from '$lib/subscriptions';
  import { toasts } from '$lib/toasts';
  import { PaymentMethod, zeus } from '$lib/zeus';
  import party from 'party-js';
  import { onMount } from 'svelte';
  import IconCancel from '~icons/mdi/cancel';
  import IconDownload from '~icons/mdi/download-outline';
  import type { PageData } from './$types';

  let confirmingCancellation = false;
  let paymentLoading = false;
  let serverError = '';
  let paying = false;

  onMount(() => {
    if (data.markedAsPaid) {
      toasts.success('Place payée', 'Ta place a bien été payée.');
      track('booking-page-paid-toast-shown');
    }

    $subscribe(
      {
        registration: [
          { id: data.registration.id },
          {
            '__typename': true,
            '...on Error': { message: true },
            '...on SubscriptionRegistrationSuccess': {
              data: {
                opposed: true,
                cancelled: true,
                paid: true,
                verified: true,
              },
            },
          },
        ],
      },
      async (result) => {
        const freshData = await result;
        if ('errors' in freshData) return;
        if (freshData.registration.__typename === 'SubscriptionRegistrationSuccess') {
          const { verified, ...rest } = freshData.registration.data as {
            verified: boolean;
            opposed: boolean;
            cancelled: boolean;
            paid: boolean;
          };
          if (verified && !data.registration.verified)
            party.sparkles(party.Rect.fromScreen(), { count: 800 });

          data.registration = {
            ...data.registration,
            verified,
            ...rest,
          };
        }
      },
    );
  });

  async function cancelRegistration() {
    const { cancelRegistration } = await $zeus.mutate({
      cancelRegistration: [
        { id },
        {
          '__typename': true,
          '...on Error': { message: true },
          '...on MutationCancelRegistrationSuccess': {
            data: true,
          },
        },
      ],
    });
    if (cancelRegistration.__typename === 'Error')
      toasts.error("Impossible d'annuler cette place", cancelRegistration.message);
    else await goto('..');
  }

  async function payRegistration() {
    paymentLoading = true;
    const { paidRegistration } = await $zeus.mutate({
      paidRegistration: [
        { regId: id, phone, beneficiary, paymentMethod },
        {
          '__typename': true,
          '...on Error': { message: true },
          '...on MutationPaidRegistrationSuccess': {
            __typename: true,
          },
        },
      ],
    });
    if (paidRegistration.__typename === 'Error') {
      serverError = paidRegistration.message;
      paymentLoading = false;
    } else {
      window.location.reload();
    }
  }

  export let data: PageData;

  $: ({
    beneficiary,
    beneficiaryUser,
    authorIsBeneficiary,
    authorEmail,
    paid,
    opposed,
    cancelled,
    verified,
    author,
    ticket,
    ticket: { links },
    id,
    createdAt,
    paymentMethod,
  } = data.registration);
  $: code = id.replace(/^r:/, '').toUpperCase();
  let phone = $me?.phone ?? '';
  const { viewbox: qrcodeViewbox, path: qrcodePath } = data.registrationQRCode;
</script>

<div class="content">
  <h1>
    <BackButton go=".." />
    Ma place
    <div class="payment-status">
      <BadgePaymentStatus
        feminin
        {cancelled}
        {paid}
        {opposed}
        {verified}
        free={ticket.basePrice === 0}
      />
    </div>
  </h1>

  {#if !paid && paymentMethod === PaymentMethod.Lydia}
    <form class="pay" on:submit|preventDefault={payRegistration}>
      <InputText
        initial={$me?.phone}
        type="tel"
        label="Numéro de téléphone"
        maxlength={255}
        bind:value={phone}
      />
      <section class="submit">
        <ButtonPrimary
          track="booking-pay-from-qrcode"
          trackData={{ by: 'lydia' }}
          loading={paymentLoading}
          submits
          >Payer {Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
          }).format(ticket.price)}</ButtonPrimary
        >
      </section>
    </form>
    {#if serverError}
      <Alert theme="danger">{serverError}</Alert>
    {/if}
  {:else if !paid && paymentMethod === PaymentMethod.PayPal}
    {#if !paying}
      <ButtonPrimary
        track="booking-pay-from-qrcode"
        trackData={{ by: 'paypal' }}
        loading={paymentLoading}
        on:click={() => {
          paying = true;
        }}
        >Payer {Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
        }).format(ticket.price)}</ButtonPrimary
      >
    {:else}
      <AreaPaypalPayRegistration bind:paymentLoading {beneficiary} registrationId={id} />
    {/if}
  {/if}

  {#if !cancelled}
    <section class="action-buttons">
      <ButtonSecondary data-sveltekit-reload href="../{code}.pdf" icon={IconDownload}
        >PDF</ButtonSecondary
      >
      <ButtonAddToGoogleWallet
        on:click={async () => {
          const { createGoogleWalletPass } = await $zeus.mutate({
            createGoogleWalletPass: [{ code }, true],
          });
          window.location.href = createGoogleWalletPass;
        }}
      />
    </section>
  {/if}

  <section class="code">
    {#if cancelled}
      <div class="qrcode cancelled">Place<br />annulée</div>
    {:else}
      <div class="qrcode-box">
        <svg class="qrcode" viewBox={qrcodeViewbox} stroke="#000" stroke-width="1.05">
          <path d={qrcodePath} fill="black" />
        </svg>
        <p class="registration-code">{code}</p>
      </div>
    {/if}
  </section>

  {#if links}
    <section class="links">
      {#each links as { computedValue, value, name }}
        <ButtonSecondary
          track="link-click-from-booking"
          trackData={{ url: value }}
          href={computedValue}>{name}</ButtonSecondary
        >
      {/each}
    </section>
  {/if}

  <section class="info">
    <dl>
      <dt>Bénéficiaire</dt>
      <dd>
        {#if authorIsBeneficiary}
          {author?.fullName ?? authorEmail}
        {:else if beneficiaryUser}
          {beneficiaryUser.fullName}
        {:else}
          {beneficiary}
        {/if}
      </dd>
      <dt>Payée par</dt>
      <dd>{author?.fullName ?? authorEmail}</dd>
      <dt>Place</dt>
      <dd>{ticket.name}</dd>
      <dt>Prix</dt>
      <dd>{ticket.basePrice}€</dd>
      <dt>Méthode de paiement</dt>
      <dd>{DISPLAY_PAYMENT_METHODS[paymentMethod ?? 'Other']}</dd>
      <dt>Évènement</dt>
      <dd>
        <a href={refroute('/events/[id]', ticket.event.localID)}>{ticket.event.title}</a>
        {#if ticket.event.startsAt}({dateTimeFormatter.format(
            new Date(ticket.event.startsAt),
          )}){/if}
      </dd>
      <dt>Date de réservation</dt>
      <dd>{formatDateTime(createdAt)}</dd>
    </dl>
  </section>

  {#if !cancelled && $me}
    <section class="cancel">
      {#if !confirmingCancellation}
        <ButtonSecondary
          track="booking-cancel-start"
          danger
          on:click={async () => {
            if (paid) confirmingCancellation = true;
            else await cancelRegistration();
          }}
          ><IconCancel />
          {#if paid}Libérer{:else}Annuler{/if} ma place</ButtonSecondary
        >
      {:else}
        <Alert theme="danger">
          <div class="confirm-cancellation">
            <h2>Es-tu sûr·e ?</h2>
            <p>
              Il n'est pas possible de revenir en arrière. Tu devras de nouveau prendre une place
              (s'il en reste) si tu veux de nouveau en réserver une. Le remboursement n'est pas
              systématique, contacte l'organisation pour savoir si tu sera remboursé·e.
            </p>
            <ButtonPrimary track="booking-cancel-confirm" on:click={cancelRegistration}
              >Oui, je confirme</ButtonPrimary
            >
          </div>
        </Alert>
      {/if}
    </section>
  {/if}

  <section class="explainer">
    <p class="typo-details">
      Cette page vaut billet. Montre-la à l'entrée de l'évènement pour faire valloir cette
      réservation. Tu peux prendre une capture d'écran et montrer celle-ci.
    </p>
  </section>
</div>

<style>
  section.code {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 0 auto;
  }

  div.qrcode-box {
    padding: 1rem;
    color: #000;
    background-color: #fff;
    border-radius: var(--radius-block);
  }

  h1 {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .payment-status {
    margin-right: 1.5rem;
    margin-left: auto;
  }

  section.action-buttons {
    display: flex;
    flex-wrap: wrap;

    /* see https://developers.google.com/wallet/generic/resources/brand-guidelines#clear-space */
    gap: 10px;
    align-items: center;
    justify-content: center;
  }

  section.action-buttons :global(> .button-secondary) {
    /* to make all buttons the same height as the "add to wallet" button */
    height: 55px;
  }

  .qrcode {
    width: 100%;
    max-height: 40vh;
  }

  .qrcode.cancelled {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    width: 40vh;
    height: 40vh;
    margin: 0 auto;
    font-size: 2rem;
    font-weight: bold;
    line-height: 1;
    color: var(--danger);
    text-align: center;
    text-transform: uppercase;
    border: var(--border-block) solid var(--danger);
  }

  .registration-code {
    margin-top: 0.5rem;
    font-family: monospace;
    font-family: var(--font-mono);
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
  }

  section.cancel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    justify-content: center;
  }

  section.links {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: center;
  }

  section.info {
    margin: 0 auto;
  }

  .confirm-cancellation {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    align-items: center;
    justify-content: center;
  }

  form.pay {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: end;
    margin: 0 auto;
  }

  section.explainer {
    max-width: 400px;
    margin: 0 2rem;
    text-align: justify;
  }

  .content {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  @media (min-width: 1000px) {
    .content {
      display: grid;
      grid-template-areas: 'header header' 'pay pay' 'actions actions' 'links links' 'qrcode details' 'qrcode cancel' 'fineprint fineprint';
      max-width: 1000px;
    }

    section.action-buttons {
      grid-area: actions;
    }

    section.links {
      grid-area: links;
    }

    section.explainer {
      grid-area: fineprint;
      max-width: unset;
      margin-top: 2rem;
    }

    section.cancel {
      display: flex;
      flex-direction: column;
      grid-area: cancel;
      align-items: center;
    }

    section.info {
      grid-area: details;
    }

    section.code {
      grid-area: qrcode;
    }

    h1 {
      grid-area: header;
    }

    h1 + form {
      grid-area: pay;
    }
  }

  @keyframes verified {
    0% {
      transform: scale(1);
    }

    50% {
      transform: scale(1.2);
    }

    100% {
      transform: scale(1);
    }
  }
</style>
