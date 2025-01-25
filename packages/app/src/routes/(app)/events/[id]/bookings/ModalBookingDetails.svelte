<script lang="ts">
  import {
    fragment,
    graphql,
    type PageEventAllBookings_ModalBookingDetails,
    type PageEventAllBookings_ModalBokingDetailsEvent,
  } from '$houdini';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import BookingAuthor from '$lib/components/BookingAuthor.svelte';
  import BookingBeneficiary from '$lib/components/BookingBeneficiary.svelte';
  import BookingPaymentMethod from '$lib/components/BookingPaymentMethod.svelte';
  import BookingStatus from '$lib/components/BookingStatus.svelte';
  import ButtonCopyToClipboard from '$lib/components/ButtonCopyToClipboard.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import { formatDateTimeSmart } from '$lib/dates';
  import { loaded, loading, LoadingText, mapLoading } from '$lib/loading';
  import { refroute } from '$lib/navigation';
  import { isPWA } from '$lib/pwa';
  import { route } from '$lib/ROUTES';
  import IconOpenTicketPage from '~icons/msl/open-in-new';

  export let event: PageEventAllBookings_ModalBokingDetailsEvent | null;
  $: dataEvent = fragment(
    event,
    graphql(`
      fragment PageEventAllBookings_ModalBokingDetailsEvent on Event @loading {
        enforcePointOfContact
      }
    `),
  );

  let booking: PageEventAllBookings_ModalBookingDetails | null = null;
  $: data = fragment(
    booking,
    graphql(`
      fragment PageEventAllBookings_ModalBookingDetails on Registration @loading {
        id
        code
        ...BookingBeneficiary
        ...BookingAuthor
        pointOfContact {
          ...AvatarUser
        }
        authorEmail
        ticket {
          name
        }
        verifiedAt
        verifiedBy {
          ...AvatarUser
        }
        cancelledAt
        cancelledBy {
          ...AvatarUser
        }
        opposedAt
        opposedBy {
          ...AvatarUser
        }
        updatedAt
        ...BookingPaymentMethod
        ...BookingStatus
        authorIsBeneficiary
        author {
          ...AvatarUser
        }
      }
    `),
  );

  let openModal: () => void;

  /** Bind this function to a variable and call it with the booking to open details on */
  export const open = (selected: PageEventAllBookings_ModalBookingDetails) => {
    booking = selected;
    openModal?.();
  };
</script>

<ModalOrDrawer narrow bind:open={openModal}>
  <svelte:fragment slot="header">
    <h1 class="modal-detail-title">Détail</h1>
    <ButtonSecondary
      target={isPWA() ? undefined : '_blank'}
      icon={IconOpenTicketPage}
      href={(isPWA() ? refroute : route)('/bookings/[code]', loading($data?.code, ''))}
    >
      Voir le billet
    </ButtonSecondary>
  </svelte:fragment>
  {#if $data}
    <dl>
      <dt>Code de réservation</dt>
      <dd>
        <code>{$data.code}</code>
        {#if loaded($data.code)}
          <ButtonCopyToClipboard text={$data.code}></ButtonCopyToClipboard>
        {/if}
      </dd>
      <dt>Place pour</dt>
      <dd>
        <BookingBeneficiary booking={$data} />
      </dd>
      <dt>Payée par</dt>
      <dd>
        <BookingAuthor booking={$data} />
      </dd>
      {#if $dataEvent?.enforcePointOfContact || $data.pointOfContact}
        <dt>Référent·e</dt>
        <dd>
          {#if $data.pointOfContact}
            <AvatarUser name user={$data.pointOfContact} />
          {:else}
            <span class="muted">Aucun·e</span>
          {/if}
        </dd>
      {/if}
      {#if $data.verifiedAt || $data.verifiedBy}
        <dt>Scannée</dt>
        <dd>
          {#if $data.verifiedAt}
            <LoadingText value={mapLoading($data.verifiedAt, formatDateTimeSmart)}></LoadingText>
          {/if}
          {#if $data.verifiedBy}
            Par <AvatarUser name user={$data.verifiedBy}></AvatarUser>
          {/if}
        </dd>
      {/if}
      {#if $data.cancelledAt || $data.cancelledBy}
        <dt>Annulée</dt>
        <dd>
          {#if $data.cancelledAt}
            <LoadingText value={mapLoading($data.cancelledAt, formatDateTimeSmart)}></LoadingText>
          {/if}
          {#if $data.cancelledBy}
            Par <AvatarUser name user={$data.cancelledBy}></AvatarUser>
          {/if}
        </dd>
      {/if}
      {#if $data.opposedAt || $data.opposedBy}
        <dt>Opposée</dt>
        <dd>
          {#if $data.opposedAt}
            <LoadingText value={mapLoading($data.opposedAt, formatDateTimeSmart)}></LoadingText>
          {/if}
          {#if $data.opposedBy}
            Par <AvatarUser name user={$data.opposedBy}></AvatarUser>
          {/if}
        </dd>
      {/if}
      <dt>État</dt>
      <dd>
        <BookingStatus booking={$data} />
      </dd>
      <dt>Moyen de paiement</dt>
      <dd>
        <BookingPaymentMethod emptyText="Non choisi" booking={$data} />
      </dd>
    </dl>
  {/if}
</ModalOrDrawer>

<style>
  dl {
    padding: 1rem 2rem;
  }

  dl dd {
    display: flex;
    gap: 0.5ch;
    align-items: center;
  }
</style>
