<script lang="ts">
  import { page } from '$app/stores';
  import { type PageEventAllBookings$result } from '$houdini';
  import {
    AvatarUser,
    BookingBeneficiary,
    BookingStatus,
    ButtonCopyToClipboard,
    ButtonSecondary,
    MaybeError,
    NavigationTabs,
  } from '$lib/components';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import { formatDateTimeSmart } from '$lib/dates';
  import { DISPLAY_PAYMENT_METHODS, ICONS_PAYMENT_METHODS } from '$lib/display';
  import { allLoaded, loaded, loading, LoadingText, mapLoading } from '$lib/loading';
  import { route } from '$lib/ROUTES';
  import { infinitescroll } from '$lib/scroll';
  import { notNull } from '$lib/typing';
  import IconOpenTicketPage from '~icons/msl/open-in-new';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageEventAllBookings } = data);

  const FILTERS = ['unpaid', 'paid', 'verified'] as const;

  let openBookingDetailModal: () => void;
  let bookingToShowDetails: PageEventAllBookings$result['event']['bookings']['nodes'][number];
</script>

<ModalOrDrawer bind:open={openBookingDetailModal}>
  <svelte:fragment slot="header">
    <h1 class="modal-detail-title">Détail</h1>
    <ButtonSecondary
      target="_blank"
      icon={IconOpenTicketPage}
      href={route('/bookings/[code]', loading(bookingToShowDetails?.code, ''))}
    >
      Voir le billet
    </ButtonSecondary>
  </svelte:fragment>
  {#if bookingToShowDetails}
    <dl>
      <dt>Code de réservation</dt>
      <dd>
        <code>{bookingToShowDetails.code}</code>
        {#if loaded(bookingToShowDetails.code)}
          <ButtonCopyToClipboard text={bookingToShowDetails.code}></ButtonCopyToClipboard>
        {/if}
      </dd>
    </dl>
  {/if}
</ModalOrDrawer>

<MaybeError result={$PageEventAllBookings} let:data={{ event }}>
  <div class="contents">
    <header>
      <h1>Réservations</h1>
      <NavigationTabs
        tabs={FILTERS.map((name) => ({
          name,
          active: name === ($page.url.searchParams.get('tab') ?? 'unpaid'),
          // href: route('/events/[id]/bookings', $page.params.id, {
          //   tab: name,
          // }),
          href: `?tab=${name}`,
        }))}
      >
        <div class="tab" let:tab let:active class:active>
          <span class="tab-title">
            {#if tab === 'unpaid'}
              Non payées
            {:else if tab === 'paid'}
              Payées
            {:else if tab === 'verified'}
              Scannées
            {/if}
          </span>
          <div class="subtitle muted">
            {#if tab === 'unpaid'}
              <LoadingText value={event.bookingsCounts.unpaidAll}>...</LoadingText> · dont <LoadingText
                value={event.bookingsCounts.unpaidLydias}>...</LoadingText
              > Lydias
            {:else if tab === 'paid'}
              <LoadingText value={event.bookingsCounts.paid}>...</LoadingText>
            {:else if tab === 'verified'}
              <LoadingText value={event.bookingsCounts.verified}>...</LoadingText>
            {/if}
          </div>
        </div>
      </NavigationTabs>
    </header>
    <ul class="bookings" use:infinitescroll={() => PageEventAllBookings.loadNextPage()}>
      {#each event.bookings.nodes.filter(notNull) as booking}
        <li>
          <button
            class="booking"
            on:click={() => {
              bookingToShowDetails = booking;
              openBookingDetailModal?.();
            }}
          >
            <div class="top">
              <div class="beneficiary">
                <BookingBeneficiary {booking} />
                <div class="author desktop-only">
                  {#if booking.author && loading(booking.authorIsBeneficiary, false)}
                    Payé par <AvatarUser user={booking.author} />
                    <LoadingText value={booking.author.fullName} />
                  {:else}
                    <p></p>
                  {/if}
                </div>
              </div>
              <div class="code">
                <LoadingText tag="code" value={booking.code}></LoadingText>
              </div>
            </div>
            <div class="bottom">
              <BookingStatus {booking} />
              <div class="date muted">
                <LoadingText value={mapLoading(booking.updatedAt, formatDateTimeSmart)} />
              </div>
              {#if allLoaded(event.tickets) && event.tickets.length > 1}
                <div class="ticket">
                  <LoadingText value={booking.ticket.name} />
                </div>
              {:else}
                <div class="payment">
                  {#if loaded(booking.paymentMethod)}
                    <svelte:component this={ICONS_PAYMENT_METHODS[booking.paymentMethod]}
                    ></svelte:component>
                    <span class="payment-method-name desktop-only"
                      >{DISPLAY_PAYMENT_METHODS[booking.paymentMethod]}</span
                    >
                  {:else}
                    <LoadingText>...</LoadingText>
                  {/if}
                </div>
              {/if}
            </div>
          </button>
        </li>
      {:else}
        <li class="booking empty muted">Aucune résevation pour le moment</li>
      {/each}
    </ul>
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  .bookings {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .booking {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 1rem 1.5rem;
    cursor: pointer;
    border-radius: var(--border-block);
  }

  .booking:hover,
  .booking:focus-visible {
    background-color: var(--bg2);
  }

  .code {
    margin-left: auto;
    font-size: 0.8rem;
    color: var(--bg4);
    text-transform: uppercase;
  }

  @media (max-width: 900px) {
    .booking .desktop-only {
      display: none;
    }

    .bottom {
      justify-content: space-between;
    }
  }

  .top {
    display: flex;
    gap: 1rem;
    align-items: center;
    width: 100%;
  }

  .beneficiary {
    font-size: 1.2em;
  }

  .bottom {
    display: flex;
    gap: 1rem;
    align-items: center;
    width: 100%;
    container: bottom / inline-size;
  }

  @container bottom (min-width: 300px) {
    .booking .payment-method-name {
      display: inline;
    }
  }

  .payment {
    color: var(--shy);
  }

  .author,
  .payment {
    display: flex;
    gap: 0.5em;
    align-items: center;
  }

  .beneficiary,
  .date {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
