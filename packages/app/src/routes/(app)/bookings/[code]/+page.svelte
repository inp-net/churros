<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { type PaymentMethod$options } from '$houdini';
  import {
    BookingAuthor,
    BookingBeneficiary,
    ButtonAddToGoogleWallet,
    ButtonPrimary,
    ButtonSecondary,
    CardEvent,
    InputText,
    LoadingChurros,
    MaybeError,
    ModalOrDrawer,
    PillLink,
  } from '$lib/components';
  import BookingPaymentMethod from '$lib/components/BookingPaymentMethod.svelte';
  import { formatDateTime } from '$lib/dates';
  import { LoadingText, allLoaded, loaded, loading, mapLoading, onceAllLoaded } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { refroute } from '$lib/navigation';
  import { route } from '$lib/ROUTES';
  import { toasts } from '$lib/toasts';
  import IconCancel from '~icons/msl/block';
  import IconDownload from '~icons/msl/download';
  import type { PageData } from './$houdini';
  import { CancelBooking, CreateGoogleWalletPass, PayBooking } from './mutations';

  export let data: PageData;
  $: ({ PageBooking } = data);
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons

  let phone = '';
  let paymentMethod: PaymentMethod$options;
  const beneficiary = '';
  let paying = false;
  let openCancellationConfirmation: () => void;
</script>

<svelte:window
  on:NAVTOP_GOTO_EVENT_FROM_BOOKING={() => {
    const eventID = $PageBooking.data?.booking.ticket.event.localID;
    if (!loaded(eventID)) return;
    goto(refroute('/events/[id]', eventID));
  }}
/>

<ModalOrDrawer bind:open={openCancellationConfirmation}>
  <h2 slot="header">Es-tu sûr·e ?</h2>
  <div class="confirm-cancellation">
    <p class="explainer">
      Il n'est pas possible de revenir en arrière. Tu devras de nouveau prendre une place (s'il en
      reste) si tu veux de nouveau en réserver une. Le remboursement n'est pas systématique,
      contacte l'organisation pour savoir si tu sera remboursé·e.
    </p>
    <ButtonPrimary
      danger
      track="booking-cancel-confirm"
      on:click={async () => {
        if (
          toasts.mutation(
            await CancelBooking.mutate({
              code: $page.params.code,
            }),
            'cancelBooking',
            'Place annulée',
            "Impossible d'annuler la place",
          )
        ) 
          await goto(route('/bookings'));
        
      }}>Oui, je confirme</ButtonPrimary
    >
  </div>
</ModalOrDrawer>

<MaybeError result={$PageBooking} let:data={{ booking, me }}>
  <div class="contents">
    {#if !booking.paid && paymentMethod === 'Lydia'}
      <form
        class="pay"
        on:submit|preventDefault={async () => {
          paying = true;
          toasts.mutation(
            await PayBooking.mutate({
              code: booking.code,
              phone,
              paymentMethod,
              beneficiary,
            }),
            'payBooking',
            'Demande de paiement envoyée',
            'Impossible de payer',
          );
          paying = false;
        }}
      >
        <InputText
          initial={me?.phone}
          type="tel"
          label="Numéro de téléphone"
          maxlength={255}
          bind:value={phone}
        />
        <section class="submit">
          <ButtonPrimary
            track="booking-pay-from-qrcode"
            trackData={{ by: 'lydia' }}
            loading={paying}
            submits
          >
            <LoadingText
              value={mapLoading(
                booking.ticket.price,
                (price) =>
                  `Payer ${Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(price)}`,
              )}
            />
          </ButtonPrimary>
        </section>
      </form>
    {/if}

    {#if !onceAllLoaded([booking.cancelled, booking.opposed], (cancelled, opposed) => cancelled || opposed, false)}
      <section class="action-buttons">
        <ButtonSecondary
          data-sveltekit-reload
          href={route('GET /bookings/[code].pdf', loading(booking.code, ''))}
          icon={IconDownload}>PDF</ButtonSecondary
        >
        <ButtonAddToGoogleWallet
          on:click={async () => {
            const result = await mutate(CreateGoogleWalletPass, {
              code: booking.code,
            });
            if (
              toasts.mutation(
                result,
                'createGoogleWalletPass',
                'Pass ajouté à Google Wallet',
                "Impossible d'ajouter le pass à Google Wallet",
              )
            ) 
              window.location.href = result.data.createGoogleWalletPass.data;
            
          }}
        />
      </section>
    {/if}

    <section class="code">
      {#if loading(booking.cancelled, false)}
        <div class="qrcode cancelled">Place<br />annulée</div>
      {:else}
        <div class="qrcode-box">
          {#if !allLoaded(booking.qrCode)}
            <LoadingChurros />
          {:else}
            <svg class="qrcode" viewBox={booking.qrCode.viewbox} stroke="#000" stroke-width="1.05">
              <path d={booking.qrCode.path} fill="black" />
            </svg>
            <p class="registration-code">
              <LoadingText value={booking.code} />
            </p>
          {/if}
        </div>
      {/if}
    </section>

    {#if booking.ticket.links.length > 0}
      <section class="links">
        {#each booking.ticket.links as link}
          <PillLink track="link-from-booking" {link} />
        {/each}
      </section>
    {/if}

    <section class="info">
      <dl>
        <dt>Bénéficiaire</dt>
        <dd>
          <BookingBeneficiary {booking} />
        </dd>
        <dt>Payée par</dt>
        <dd>
          <BookingAuthor {booking} />
        </dd>
        <dt>Place</dt>
        <dd><LoadingText value={booking.ticket.name}></LoadingText></dd>
        <dt>Prix</dt>
        <dd>
          <LoadingText
            value={mapLoading(booking.ticket.basePrice, (price) => {
              return Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(price);
            })}
          />
        </dd>
        <dt>Méthode de paiement</dt>
        <dd>
          <BookingPaymentMethod {booking} />
        </dd>
        <dt>Évènement</dt>
        <dd>
          <CardEvent event={booking.ticket.event} />
        </dd>
        <dt>Date de réservation</dt>
        <dd>
          <LoadingText value={mapLoading(booking.createdAt, formatDateTime)} />
        </dd>
      </dl>
    </section>

    {#if !loading(booking.cancelled, false) && me}
      <section class="cancel">
        <ButtonSecondary track="booking-cancel-start" danger on:click={openCancellationConfirmation}
          ><IconCancel />
          {#if loading(booking.paid, false)}Libérer{:else}Annuler{/if} ma place</ButtonSecondary
        >
      </section>
    {/if}

    <p class="explainer">
      Cette page vaut billet. Montre-la à l'entrée de l'évènement pour faire valloir cette
      réservation. Tu peux prendre une capture d'écran et montrer celle-ci.
    </p>
  </div>
</MaybeError>

<style>
  dt {
    margin-top: 1rem;
  }

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

  .explainer {
    max-width: 400px;
    margin: 0 2rem;
    color: var(--shy);
  }

  .contents {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    padding: 0 1rem;
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
