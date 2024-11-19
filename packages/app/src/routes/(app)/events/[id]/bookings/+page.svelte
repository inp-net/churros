<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { graphql, type PageEventBookings_ItemBooking$data } from '$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import BookingAuthor from '$lib/components/BookingAuthor.svelte';
  import BookingBeneficiary from '$lib/components/BookingBeneficiary.svelte';
  import BookingPaymentMethod from '$lib/components/BookingPaymentMethod.svelte';
  import BookingStatus from '$lib/components/BookingStatus.svelte';
  import ButtonCopyToClipboard from '$lib/components/ButtonCopyToClipboard.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputSearchQuery from '$lib/components/InputSearchQuery.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { formatDateTimeSmart } from '$lib/dates';
  import { countThing } from '$lib/i18n';
  import { loaded, loading, LoadingText, mapLoading, type MaybeLoading } from '$lib/loading';
  import { refroute } from '$lib/navigation';
  import { isPWA } from '$lib/pwa';
  import { route } from '$lib/ROUTES';
  import { infinitescroll } from '$lib/scroll';
  import { onMount } from 'svelte';
  import { queryParam } from 'sveltekit-search-params';
  import IconOpenTicketPage from '~icons/msl/open-in-new';
  import type { PageData } from './$houdini';
  import { tabToFilter } from './filters';
  import ItemBooking from './ItemBooking.svelte';

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

  let openBookingDetailModal: () => void;
  let selectedBooking: PageEventBookings_ItemBooking$data | null = null;

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
    filter: tabToFilter[$activeTab ?? DEFAULT_FILTER],
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
    window.dispatchEvent(
      new CustomEvent('NAVTOP_UPDATE_TITLE', {
        detail: `${total} réservation${total > 1 ? 's' : ''}`,
      }),
    );
  }

  $: showingSearchResults = $q && $SearchBookings.data?.event;

  $: bookings =
    $q && $SearchBookings.data?.event
      ? $SearchBookings.data.event.searchBookings.map((r) => ({
          ...r.registration,
          byCode: r.byCode as MaybeLoading<boolean>,
        }))
      : ($PageEventAllBookings.data?.event.bookings.edges.map((e) => ({
          ...e.node,
          byCode: false as MaybeLoading<boolean>,
        })) ?? []);

  const SearchBookings = graphql(`
    query PageEventBookings_Search($event: LocalID!, $q: String!) {
      event(id: $event) {
        searchBookings(q: $q) {
          byCode
          registration {
            ...PageEventBookings_ItemBooking
          }
        }
      }
    }
  `);
</script>

<ModalOrDrawer bind:open={openBookingDetailModal}>
  <svelte:fragment slot="header">
    <h1 class="modal-detail-title">Détail</h1>
    <ButtonSecondary
      target={isPWA() ? undefined : '_blank'}
      icon={IconOpenTicketPage}
      href={(isPWA() ? refroute : route)('/bookings/[code]', loading(selectedBooking?.code, ''))}
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
      <InputSearchQuery
        placeholder="Rechercher par nom, code, email..."
        q={initialQ}
        on:debouncedInput={async ({ detail }) => {
          $q = detail;
          if (!detail) return;
          await SearchBookings.fetch({
            variables: {
              event: $page.params.id,
              q: detail,
            },
          });
        }}
      ></InputSearchQuery>

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
      {#if loading(event.bookings.pageInfo.hasNextPage, false)}
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
