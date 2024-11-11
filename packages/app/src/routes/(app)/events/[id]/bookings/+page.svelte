<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { graphql, type PageEventAllBookings_ModalBookingDetails } from '$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { loaded, LoadingText, mapAllLoading, mapLoading } from '$lib/loading';
  import { route } from '$lib/ROUTES';
  import { infinitescroll } from '$lib/scroll';
  import type { PageData } from './$houdini';
  import { downloadCsv } from './csv';
  import { tabToFilter } from './filters';
  import ItemBooking from './ItemBooking.svelte';
  import ModalBookingDetails from './ModalBookingDetails.svelte';

  export let data: PageData;
  $: ({ PageEventAllBookings } = data);

  const FILTERS = ['unpaid', 'paid', 'verified'] as const;
  $: activeTab = ($page.url.searchParams.get('tab') ?? 'unpaid') as (typeof FILTERS)[number];

  let openBookingDetailModal: (booking: PageEventAllBookings_ModalBookingDetails) => void;

  const updates = graphql(`
    subscription BookingsListUpdates($id: LocalID!, $filter: BookingState!) {
      event(id: $id) {
        bookings(first: 10, only: $filter) {
          nodes {
            # we only _count_ new bookings, we don't need to load any data
            # since loading them in would make a jump in the UI
            # so we only show a notice that "n new bookings have been made, reload?"
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
        !$PageEventAllBookings.data?.event.bookings.nodes.some(
          (existing) => existing.id === fresh.id,
        ),
    ).length ?? 0;

  $: if (
    browser &&
    $PageEventAllBookings.data &&
    loaded($PageEventAllBookings.data.event.bookingsCounts.total)
  ) {
    const total = $PageEventAllBookings.data.event.bookingsCounts.total;
    window.dispatchEvent(
      new CustomEvent('NAVTOP_UPDATE_TITLE', {
        detail: `${total} réservation${total > 1 ? 's' : ''}`,
      }),
    );
  }
</script>

<svelte:window
  on:NAVTOP_DOWNLOAD_CSV={async () => {
    await downloadCsv($page.params.id);
  }}
/>

<MaybeError result={$PageEventAllBookings} let:data={{ event }}>
  <ModalBookingDetails {event} bind:open={openBookingDetailModal} />
  <div class="contents">
    <header>
      {#if newBookingsCount}
        <Alert theme="primary">
          {newBookingsCount} nouvelles réservations
          <ButtonSecondary on:click={async () => PageEventAllBookings.fetch()}>
            Charger
          </ButtonSecondary>
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
      {#each event.bookings.nodes as booking}
        <ItemBooking
          on:openDetails={({ detail }) => openBookingDetailModal(detail)}
          {booking}
          showTicketName={mapAllLoading(
            event.tickets.map((t) => t.id),
            (...ids) => ids.length > 1,
          )}
        />
      {:else}
        <li class="booking empty muted">Aucune réservation pour le moment</li>
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

  .tab .subtitle {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 0.8em;
  }
</style>
