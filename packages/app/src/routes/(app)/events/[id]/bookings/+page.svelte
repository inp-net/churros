<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { graphql, type PageEventAllBookings$result } from '$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import BookingAuthor from '$lib/components/BookingAuthor.svelte';
  import BookingBeneficiary from '$lib/components/BookingBeneficiary.svelte';
  import BookingPaymentMethod from '$lib/components/BookingPaymentMethod.svelte';
  import BookingStatus from '$lib/components/BookingStatus.svelte';
  import ButtonCopyToClipboard from '$lib/components/ButtonCopyToClipboard.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import LoadingScreen from '$lib/components/LoadingScreen.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { formatDateTimeSmart } from '$lib/dates';
  import { allLoaded, loaded, loading, LoadingText, mapLoading } from '$lib/loading';
  import { refroute } from '$lib/navigation';
  import { isPWA } from '$lib/pwa';
  import { route } from '$lib/ROUTES';
  import { infinitescroll } from '$lib/scroll';
  import IconOpenTicketPage from '~icons/msl/open-in-new';
  import type { PageData } from './$houdini';
  import { tabToFilter } from './filters';

  export let data: PageData;
  $: ({ PageEventAllBookings } = data);

  const FILTERS = ['unpaid', 'paid', 'verified'] as const;
  $: activeTab = ($page.url.searchParams.get('tab') ?? 'unpaid') as (typeof FILTERS)[number];

  let openBookingDetailModal: () => void;
  let selectedBooking: PageEventAllBookings$result['event']['bookings']['edges'][number]['node'];

  const updates = graphql(`
    subscription BookingsListUpdates($id: LocalID!, $filter: BookingState!) {
      event(id: $id) {
        bookings(first: 10, only: $filter) {
          nodes {
            id
          }
        }
      }
    }
  `);

  $: updates.listen({
    id: $page.params.id,
    filter: tabToFilter[activeTab],
  });

  // Count new bookings by taking the length of the intersection of booking IDs from updates and PageEventAllBookings
  $: newBookingsCount =
    $updates.data?.event.bookings.nodes.filter(
      (fresh) =>
        !$PageEventAllBookings.data?.event.bookings.edges.some(
          ({ node: existing }) => existing.id === fresh.id,
        ),
    ).length ?? 0;

  $: if (
    browser &&
    $PageEventAllBookings.data &&
    loaded($PageEventAllBookings.data.event.bookingsCounts.total)
  ) {
    const total = $PageEventAllBookings.data.event.bookingsCounts.total;
    globalThis.dispatchEvent(
      new CustomEvent('NAVTOP_UPDATE_TITLE', {
        detail: `${total} réservation${total > 1 ? 's' : ''}`,
      }),
    );
  }
</script>

<ModalOrDrawer bind:open={openBookingDetailModal}>
  <svelte:fragment slot="header">
    <h1 class="modal-detail-title">Détail</h1>
    <ButtonSecondary
      target={isPWA() ? undefined : '_blank'}
      icon={IconOpenTicketPage}
      href={(isPWA() ? refroute : route)('/bookings/[code]', loading(selectedBooking?.code, ''), {
        dontpay: '1',
      })}
    >
      Voir le billet
    </ButtonSecondary>
  </svelte:fragment>
  {#if selectedBooking}
    <dl>
      <dt>Code de réservation</dt>
      <dd>
        <code>{selectedBooking.code}</code>
        {#if loaded(selectedBooking.code)}
          <ButtonCopyToClipboard text={selectedBooking.code}></ButtonCopyToClipboard>
        {/if}
      </dd>
      <dt>Place pour</dt>
      <dd>
        <BookingBeneficiary booking={selectedBooking} />
      </dd>
      <dt>Payée par</dt>
      <dd>
        <BookingAuthor booking={selectedBooking} />
      </dd>
      {#if selectedBooking.verifiedAt || selectedBooking.verifiedBy}
        <dt>Scannée</dt>
        <dd>
          {#if selectedBooking.verifiedAt}
            <LoadingText value={mapLoading(selectedBooking.verifiedAt, formatDateTimeSmart)}
            ></LoadingText>
          {/if}
          {#if selectedBooking.verifiedBy}
            Par <AvatarUser user={selectedBooking.verifiedBy}></AvatarUser>
            <LoadingText value={selectedBooking.verifiedBy.fullName} />
          {/if}
        </dd>
      {/if}
      {#if selectedBooking.cancelledAt || selectedBooking.cancelledBy}
        <dt>Annulée</dt>
        <dd>
          {#if selectedBooking.cancelledAt}
            <LoadingText value={mapLoading(selectedBooking.cancelledAt, formatDateTimeSmart)}
            ></LoadingText>
          {/if}
          {#if selectedBooking.cancelledBy}
            Par <AvatarUser user={selectedBooking.cancelledBy}></AvatarUser>
            <LoadingText value={selectedBooking.cancelledBy.fullName} />
          {/if}
        </dd>
      {/if}
      {#if selectedBooking.opposedAt || selectedBooking.opposedBy}
        <dt>Opposée</dt>
        <dd>
          {#if selectedBooking.opposedAt}
            <LoadingText value={mapLoading(selectedBooking.opposedAt, formatDateTimeSmart)}
            ></LoadingText>
          {/if}
          {#if selectedBooking.opposedBy}
            Par <AvatarUser user={selectedBooking.opposedBy}></AvatarUser>
            <LoadingText value={selectedBooking.opposedBy.fullName} />
          {/if}
        </dd>
      {/if}
      <dt>État</dt>
      <dd>
        <BookingStatus booking={selectedBooking} />
      </dd>
      <dt>Moyen de paiement</dt>
      <dd>
        <BookingPaymentMethod booking={selectedBooking} />
      </dd>
    </dl>
  {/if}
</ModalOrDrawer>

<MaybeError result={$PageEventAllBookings} let:data={{ event }}>
  <div class="contents">
    <header>
      {#if newBookingsCount}
        <Alert theme="primary">
          {newBookingsCount} nouvelles réservations <ButtonSecondary
            on:click={async () => PageEventAllBookings.fetch()}>Charger</ButtonSecondary
          >
        </Alert>
      {/if}
      <NavigationTabs
        on:click={({ detail }) => {
          // To change tabs visually before the page has even finished loading
          activeTab = detail;
        }}
        tabs={FILTERS.map((name) => ({
          name,
          active: name === activeTab,
          href: route('/events/[id]/bookings', $page.params.id, {
            tab: name,
          }),
        }))}
      >
        <div slot="tab" class="tab" let:tab let:active class:active>
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
              <LoadingText value={event.bookingsCounts.unpaidAll}>...</LoadingText
              >{#if event.tickets.some((t) => 'Lydia' in t.allowedPaymentMethods)}
                · dont <LoadingText value={event.bookingsCounts.unpaidLydias}>...</LoadingText> Lydias{/if}
            {:else if tab === 'paid'}
              <LoadingText value={event.bookingsCounts.paid}>...</LoadingText> · <LoadingText
                value={mapLoading(event.profitsBreakdown.total, (total) => `${total}€`)}
                >...</LoadingText
              >
            {:else if tab === 'verified'}
              <LoadingText value={event.bookingsCounts.verified}>...</LoadingText>
            {/if}
          </div>
        </div>
      </NavigationTabs>
    </header>
    <ul class="bookings" use:infinitescroll={() => PageEventAllBookings.loadNextPage()}>
      {#each event.bookings.edges as { node: booking }}
        <li>
          <button
            class="booking"
            on:click={() => {
              selectedBooking = booking;
              openBookingDetailModal?.();
            }}
          >
            <div class="top">
              <div class="people">
                <div class="beneficiary">
                  <BookingBeneficiary {booking} />
                </div>
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
                  <BookingPaymentMethod {booking} />
                </div>
              {/if}
            </div>
          </button>
        </li>
      {:else}
        <li class="booking empty muted">Aucune résevation pour le moment</li>
      {/each}
    </ul>
    {#if loading(event.bookings.pageInfo.hasNextPage, false)}
      <!-- TODO: Move to ./ItemBooking.svelte and add a loading placeholder one here  -->
      <div class="loading-more">
        <LoadingScreen />
      </div>
    {/if}
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

  .author {
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

  .tab .subtitle {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 0.8em;
  }

  dl {
    padding: 1rem 2rem;
  }

  dl dd {
    display: flex;
    gap: 0.5ch;
    align-items: center;
  }

  .loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7em;
  }
</style>
