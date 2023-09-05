<script lang="ts">
  import { dateTimeFormatter, formatDateTime } from '$lib/dates';
  import * as qrcode from 'qr-code-generator-lib';
  import type { PageData } from './$types';
  import BackButton from '$lib/components/ButtonBack.svelte';
  import { onMount } from 'svelte';
  import { theme } from '$lib/theme';
  import { beforeNavigate, goto } from '$app/navigation';
  import IconCancel from '~icons/mdi/cancel';
  import Alert from '$lib/components/Alert.svelte';
  import { PaymentMethod, zeus } from '$lib/zeus';
  import InputText from '$lib/components/InputText.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import BadgePaymentStatus from '$lib/components/BadgePaymentStatus.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { DISPLAY_PAYMENT_METHODS } from '$lib/display';
  import { me } from '$lib/session';

  let actualTheme: string;
  let confirmingCancellation = false;
  let paymentLoading = false;
  let serverError = '';

  // For this page only, force light theme
  onMount(() => {
    actualTheme = $theme;
    $theme = 'light';
  });
  beforeNavigate(() => {
    $theme = actualTheme;
  });

  export let data: PageData;

  const {
    beneficiary,
    beneficiaryUser,
    authorIsBeneficiary,
    paid,
    author,
    ticket,
    ticket: { links },
    id,
    createdAt,
    paymentMethod,
  } = data.registration;
  let phone = $me?.phone ?? '';
  let qrcodeViewbox: string;
  let qrcodeDim: number;
  let qrcodePath: string;
  $: ({ d: qrcodePath, dim: qrcodeDim } = qrcode.renderPath(qrcode.getMatrix(id)));
  const qrcodeBuiltinPadding = 4;
  $: qrcodeViewbox = `${qrcodeBuiltinPadding} ${qrcodeBuiltinPadding} ${
    qrcodeDim - 2 * qrcodeBuiltinPadding
  } ${qrcodeDim - 2 * qrcodeBuiltinPadding}`;
</script>

<div class="content">
  <h1>
    <BackButton go=".." />
    Ma place
    <div class="payment-status">
      <BadgePaymentStatus feminin {paid} />
    </div>
  </h1>

  {#if !paid && paymentMethod === PaymentMethod.Lydia}
    <form
      class="pay"
      on:submit|preventDefault={async () => {
        paymentLoading = true;
        const { paidRegistration } = await $zeus.mutate({
          paidRegistration: [
            { regId: id, phone, beneficiary, paymentMethod: PaymentMethod.Lydia },
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
        if (paidRegistration.__typename === 'Error') {
          serverError = paidRegistration.message;
          paymentLoading = false;
        } else {
          window.location.reload();
        }
      }}
    >
      <InputText initial={$me?.phone} type="tel" label="Numéro de téléphone" bind:value={phone} />
      <section class="submit">
        <ButtonPrimary loading={paymentLoading} submits
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
  {/if}

  <section class="code">
    <svg class="qrcode" viewBox={qrcodeViewbox} stroke="var(--text)" stroke-width="1.05">
      <path d={qrcodePath} fill="black" />
    </svg>
    <p class="registration-code">
      {id.split(':', 2)[1].toUpperCase()}
    </p>
  </section>

  {#if links}
    <section class="links">
      {#each links as { computedValue, name }}
        <ButtonSecondary href={computedValue}>{name}</ButtonSecondary>
      {/each}
    </section>
  {/if}

  <section class="info">
    <dl>
      <dt>Bénéficiaire</dt>
      <dd>
        {#if authorIsBeneficiary}
          {author.fullName}
        {:else if beneficiaryUser}
          {beneficiaryUser.fullName}
        {:else}
          {beneficiary}
        {/if}
      </dd>
      <dt>Payée par</dt>
      <dd>{author.fullName}</dd>
      <dt>Place</dt>
      <dd>{ticket.name}</dd>
      <dt>Prix</dt>
      <dd>{ticket.price}€</dd>
      <dt>Méthode de paiement</dt>
      <dd>{DISPLAY_PAYMENT_METHODS[paymentMethod ?? 'Other']}</dd>
      <dt>Évènement</dt>
      <dd>
        <a href="/events/{ticket.event.group.uid}/{ticket.event.uid}">{ticket.event.title}</a>
        {#if ticket.event.startsAt}({dateTimeFormatter.format(
            new Date(ticket.event.startsAt)
          )}){/if}
      </dd>
      <dt>Date de réservation</dt>
      <dd>{formatDateTime(createdAt)}</dd>
    </dl>
  </section>

  <section class="cancel">
    {#if !confirmingCancellation}
      <ButtonSecondary
        danger
        on:click={async () => {
          if (paid) {
            confirmingCancellation = true;
          } else {
            await $zeus.mutate({
              deleteRegistration: [{ id }, true],
            });
            await goto('..');
          }
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
          <ButtonPrimary
            on:click={async () => {
              await $zeus.mutate({
                deleteRegistration: [{ id }, true],
              });
              await goto('..');
            }}>Oui, je confirme</ButtonPrimary
          >
        </div>
      </Alert>
    {/if}
  </section>

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

  .qrcode {
    width: 100%;
    max-height: 40vh;
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
      grid-template-areas: 'header header' 'pay pay' 'links links' 'qrcode details' 'qrcode cancel' 'fineprint fineprint';
      max-width: 1000px;
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
</style>
