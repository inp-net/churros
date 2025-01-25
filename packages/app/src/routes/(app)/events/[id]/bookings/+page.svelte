<script lang="ts">
  import { page } from '$app/stores';
  import { graphql, type PageEventAllBookings_ModalBookingDetails, type PageEventAllBookings_ItemBooking$data } from '$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputSearchQuery from '$lib/components/InputSearchQuery.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { loaded, loading, LoadingText, mapAllLoading, mapLoading, type MaybeLoading } from '$lib/loading';
  import { route } from '$lib/ROUTES';
  import { infinitescroll } from '$lib/scroll';
  import { updateTitle } from '$lib/components/NavigationTop.svelte';
  import { formatDateTimeSmart } from '$lib/dates';
  import { countThing } from '$lib/i18n';
  import { refroute } from '$lib/navigation';
  import { isPWA } from '$lib/pwa';
  import { onMount } from 'svelte';
  import { queryParam } from 'sveltekit-search-params';
  import IconOpenTicketPage from '~icons/msl/open-in-new';
  import type { PageData } from './$houdini';
  import { downloadCsv } from './csv';
  import { tabToFilter } from './filters';
  import ItemBooking from './ItemBooking.svelte';
  import ModalBookingDetails from './ModalBookingDetails.svelte';

  export let data: PageData;
  $: ({ PageEventAllBookings } = data);

  const FILTERS = ['unpaid', 'paid', 'verified'] as const;
  const DEFAULT_FILTER = 'unpaid';

  const q = queryParam('q', {
    encode: (v) => v || undefined,
    decode: (v) => v ?? '',
  });

  // Using $q as the value of the input is really bad for performance,
  // as every debounce will trigger a re-render of the input, which will trigger a re-render of the input's value. If someone types slow enough, the last character typed will be erased as $q updates with the previous value.
  // This is called a "controlled input" and is generally a bad practice.
  // Using this allows us to still fill the input value with the ?q query parameter in case we navigate to this page with a ?q set, but prevents the controlled input issues.
  let initialQ = '';
  onMount(() => {
    initialQ = $q ?? '';
  });

  const activeTab = queryParam<(typeof FILTERS)[number]>('tab', {
    encode: (v) => v || undefined,
    decode: (v) => FILTERS.find((f) => f === v) ?? DEFAULT_FILTER,
  });

  let openBookingDetailModal: (booking: PageEventAllBookings_ModalBookingDetails) => void;
  let selectedBooking: PageEventAllBookings_ItemBooking$data | null = null;

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
    filter: tabToFilter[$activeTab ?? DEFAULT_FILTER],
  });

  // Count new bookings by taking the length of the intersection of booking IDs from updates and PageEventAllBookings
  $: newBookingsCount =
    $updates.data?.event.bookings.nodes.filter(
      (fresh) =>
        !$PageEventAllBookings.data?.event.bookings?.edges.some(
          ({ node: existing }) => existing.id === fresh.id,
        ),
    ).length ?? 0;

  $: showingSearchResults = Boolean($PageEventAllBookings.data?.event.searchBookings);

  /** Array of booking objects */
  $: bookings =
    // ...if we're showing search results
    $PageEventAllBookings.data?.event.searchBookings?.map((r) => ({
      ...r.registration,
      byCode: r.byCode as MaybeLoading<boolean>,
    })) ??
    // if we're not
    $PageEventAllBookings.data?.event.bookings?.edges.map((e) => ({
      ...e.node,
      byCode: false,
    })) ??
    // if data hasn't been loaded yet
    [];

  $: if ($PageEventAllBookings.data) 
    updateTitle(countThing('réservation', $PageEventAllBookings.data.event.bookingsCounts.total));
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
        tabs={FILTERS.map((name) => ({
          name,
          active: name === $activeTab,
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

      <InputSearchQuery
        placeholder="Rechercher par nom, code, email..."
        q={initialQ}
        on:debouncedInput={async ({ detail }) => {
          $q = detail;
        }}
      ></InputSearchQuery>

      {#if newBookingsCount}
        <Alert theme="primary">
          {newBookingsCount} nouvelles réservations <ButtonSecondary
            on:click={async () => PageEventAllBookings.fetch()}>Charger</ButtonSecondary
          >
        </Alert>
      {/if}
    </header>
    <ul
      class="bookings"
      use:infinitescroll={async () => {
        if (showingSearchResults) return;
        await PageEventAllBookings.loadNextPage();
      }}
    >
      {#each bookings as booking}
        <ItemBooking
          {booking}
          highlightCode={loading(booking.byCode, false)}
          showTicketNames={event.tickets.length > 1}
          on:openDetails={({ detail }) => {
            selectedBooking = detail;
            openBookingDetailModal();
          }}
        />
      {:else}
        {#if !showingSearchResults}
          <li class="empty muted">Aucune résevation pour le moment</li>
        {/if}
      {/each}
      {#if loading(event.bookings?.pageInfo.hasNextPage, false)}
        <ItemBooking showTicketNames={event.tickets.length > 1} booking={null} />
      {/if}
    </ul>
    {#if showingSearchResults}
      <section class="search-results-count">{countThing('résultat', bookings.length)}</section>
    {/if}
  </div></MaybeError
>

<style>
  .contents {
    padding: 0 1rem;
  }

  header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  header :global(> *) {
    width: 100%;
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

  dl {
    padding: 1rem 2rem;
  }

  dl dd {
    display: flex;
    gap: 0.5ch;
    align-items: center;
  }

  .search-results-count {
    padding: 1rem;
    text-align: center;
  }
</style>
