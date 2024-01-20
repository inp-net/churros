<script lang="ts">
  import { page } from '$app/stores';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import Alert from '$lib/components/Alert.svelte';
  import Badge from '$lib/components/Badge.svelte';
  import IconRefresh from '~icons/mdi/refresh';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import { formatDateTime } from '$lib/dates';
  import { DISPLAY_PAYMENT_METHODS, PAYMENT_METHODS_ICONS } from '$lib/display';
  import { me } from '$lib/session';
  import { subscribe } from '$lib/subscriptions';
  import { toasts } from '$lib/toasts';
  import { tooltip } from '$lib/tooltip';
  import { zeus } from '$lib/zeus';
  import { compareAsc, compareDesc, format, isSameDay } from 'date-fns';
  import debounce from 'lodash.debounce';
  import { onMount } from 'svelte';
  import type { Writable } from 'svelte/store';
  import { queryParam } from 'sveltekit-search-params';
  import IconCancel from '~icons/mdi/cancel';
  import IconCheck from '~icons/mdi/check';
  import IconChevronRight from '~icons/mdi/chevron-right';
  import { default as IconClear, default as IconClose } from '~icons/mdi/close';
  import IconCash from '~icons/mdi/currency-usd';
  import IconCashOff from '~icons/mdi/currency-usd-off';
  import IconDownload from '~icons/mdi/download-outline';
  import IconOpposed from '~icons/mdi/hand-back-right-off-outline';
  import IconSearch from '~icons/mdi/magnify';
  import IconSortDown from '~icons/mdi/triangle-small-down';
  import IconSortUp from '~icons/mdi/triangle-small-up';
  import type { PageData } from './$types';
  import { _registrationsQuery } from './+page';
  import ButtonInk from '$lib/components/ButtonInk.svelte';

  export let data: PageData;
  let compact = false;
  let loadingMore = false;
  let csvExportError = '';
  let loadingSearchResults = false;
  let initialRegistrationsTotalCount = data.event.registrationsCounts.total;
  let newRegistrationsSinceLoad = 0;
  const searchQuery = queryParam('q', {
    encode: (v) => v || undefined,
    decode: (v) => v ?? '',
  }) as Writable<string>;

  let searchResults: typeof registrations = {
    pageInfo: { endCursor: undefined, hasNextPage: false },
    edges: [],
  };

  onMount(() => {
    $subscribe(
      {
        event: [
          {
            uid: $page.params.uid,
            groupUid: $page.params.group,
          },
          {
            registrationsCounts: {
              cancelled: true,
              paid: true,
              unpaidLydia: true,
              total: true,
              verified: true,
            },
          },
        ],
      },
      async (eventData) => {
        const freshData = await eventData;
        if ('errors' in freshData) return;
        const freshCounts = freshData.event?.registrationsCounts;
        if (!freshCounts) return;
        if (freshCounts.total > initialRegistrationsTotalCount)
          newRegistrationsSinceLoad = freshCounts.total - initialRegistrationsTotalCount;

        data.event.registrationsCounts = freshCounts;
      },
    );
  });

  async function submitSearchQuery(q: string) {
    if (!q) {
      loadingSearchResults = false;
      return;
    }

    loadingSearchResults = true;
    await debounce(async () => {
      const results = await $zeus.query({
        searchRegistrations: [
          {
            eventUid: $page.params.uid,
            groupUid: $page.params.group,
            q,
          },
          {
            registration: _registrationsQuery.edges.node,
          },
        ],
      });

      searchResults = {
        pageInfo: { endCursor: '', hasNextPage: false },
        edges: results.searchRegistrations.map(({ registration }) => ({
          cursor: '',
          node: registration,
        })),
      };
      loadingSearchResults = false;
    }, 500)();
  }

  async function loadMore() {
    if (loadingMore) return;
    try {
      loadingMore = true;
      const result = await $zeus.query({
        registrationsOfEvent: [
          {
            after: data.registrationsOfEvent.pageInfo.endCursor,
            groupUid: $page.params.group,
            eventUid: $page.params.uid,
          },
          _registrationsQuery,
        ],
      });
      registrations.pageInfo = result.registrationsOfEvent.pageInfo;
      registrations.edges = [...registrations.edges, ...result.registrationsOfEvent.edges];
    } finally {
      loadingMore = false;
    }
  }

  async function csv() {
    if (!registrations) return;
    const { registrationsCsv } = await $zeus.query({
      registrationsCsv: [
        { eventUid: $page.params.uid, groupUid: $page.params.group },
        {
          '__typename': true,
          '...on Error': { message: true },
          '...on QueryRegistrationsCsvSuccess': { data: true },
        },
      ],
    });

    if (registrationsCsv.__typename === 'Error') {
      csvExportError = registrationsCsv.message;
      return;
    }

    return registrationsCsv.data;
  }

  $: ({
    registrationsOfEvent: registrations,
    event: { registrationsCounts, profitsBreakdown },
  } = data);
  $: rowIsSelected = Object.fromEntries(registrations.edges.map(({ node }) => [node.id, false]));

  const COLUMNS = [
    ['date', 'Date'],
    ['state', 'État'],
    ['method', 'Via'],
    ['ticket', 'Billet'],
    ['beneficiary', 'Bénéficiaire'],
    ['contributes', 'Cotise'],
    ['major', 'Filière'],
    ['graduationYear', 'Année'],
    ['author', 'Payé par'],
    ['code', 'Code de réservation'],
  ] as const;

  function fromSortingQueryParam(sorting: string): SortOptions {
    // If sorting starts with "-", it's descending, if it starts with "+" (or nothing), it's ascending
    const desc = sorting.startsWith('-');
    const key = sorting.replace(/^-+/, '');
    return {
      by: key as typeof $sort.by,
      direction: desc ? 'descending' : 'ascending',
    };
  }

  function toSortingQueryParam(by: SortOptions['by'], direction: SortOptions['direction']) {
    return `${direction === 'descending' ? '-' : ''}${by}`;
  }

  type SortOptions = {
    by: (typeof COLUMNS)[number][0];
    direction: 'ascending' | 'descending';
  };
  const sort = queryParam<SortOptions>('sort', {
    decode: (v) => fromSortingQueryParam(v ?? '-date'),
    encode: (v) => toSortingQueryParam(v.by, v.direction),
  }) as Writable<SortOptions>;

  type Registration = (typeof registrations.edges)[number]['node'];

  function compareRegistrations(
    sortBy: SortOptions['by'],
    sortDirection: SortOptions['direction'],
  ): (a: Registration, b: Registration) => number {
    const desc = sortDirection === 'descending';
    const benefUser = (r: Registration) =>
      r.beneficiaryUser ?? (r.authorIsBeneficiary ? r.author : undefined);
    switch (sortBy) {
      case 'date': {
        return (a, b) => (desc ? compareDesc : compareAsc)(a.createdAt, b.createdAt);
      }

      case 'state': {
        const sortingIndex = (a: Registration) =>
          a.opposed ? 0 : a.cancelled ? 1 : a.verifiedAt && a.paid ? 2 : a.paid ? 3 : 4;
        return (a, b) => (desc ? -1 : 1) * (sortingIndex(a) - sortingIndex(b));
      }

      case 'method': {
        const method = (r: Registration) => r.paymentMethod?.toString() ?? '';
        return (a, b) => (desc ? -1 : 1) * method(a).localeCompare(method(b));
      }

      case 'beneficiary': {
        const benef = (r: Registration) => benefUser(r)?.fullName ?? r.beneficiary;
        return (a, b) => (desc ? -1 : 1) * benef(a).localeCompare(benef(b));
      }

      case 'contributes': {
        const contributions = (r: Registration) =>
          benefUser(r)
            ?.contributesTo.map((c) => c.name)
            .join(', ') ?? '';
        return (a, b) => (desc ? -1 : 1) * contributions(a).localeCompare(contributions(b));
      }

      case 'author': {
        const fullNameOrEmail = (r: Registration) => r.author?.fullName ?? r.authorEmail ?? '';
        return (a, b) => (desc ? -1 : 1) * fullNameOrEmail(a).localeCompare(fullNameOrEmail(b));
      }

      case 'graduationYear': {
        return (a, b) =>
          (desc ? -1 : 1) *
          ((benefUser(b)?.graduationYear ?? Number.POSITIVE_INFINITY) -
            (benefUser(a)?.graduationYear ?? Number.POSITIVE_INFINITY));
      }

      case 'major': {
        const major = (r: Registration) => benefUser(r)?.major?.shortName ?? '';
        return (a, b) => major(a).localeCompare(major(b));
      }

      case 'ticket': {
        const ticketFullName = (r: Registration) =>
          r.ticket.group ? `${r.ticket.group.name}/${r.ticket.name}` : r.ticket.name;
        return (a, b) => (desc ? -1 : 1) * ticketFullName(a).localeCompare(ticketFullName(b));
      }

      default: {
        return (a, b) => a.id.localeCompare(b.id);
      }
    }
  }

  async function oppose(registration: Registration) {
    const { opposeRegistration } = await $zeus.mutate({
      opposeRegistration: [
        { id: registration.id },
        {
          '__typename': true,
          '...on Error': {
            message: true,
          },
          '...on MutationOpposeRegistrationSuccess': {
            data: true,
          },
        },
      ],
    });
    if (opposeRegistration.__typename === 'Error') return;

    if (opposeRegistration.data) {
      const idx = registrations.edges.findIndex((r) => r.node.id === registration.id);
      registrations.edges[idx].node.opposed = true;
      registrations.edges[idx].node.opposedAt = new Date();
      registrations.edges[idx].node.opposedBy = $me;
    }
  }

  async function updatePaidStatus(markAsPaid: boolean, registration: Registration): Promise<void> {
    const { upsertRegistration } = await $zeus.mutate({
      upsertRegistration: [
        {
          id: registration.id,
          paymentMethod: registration.paymentMethod,
          beneficiary: registration.beneficiary,
          ticketId: registration.ticket.id,
          paid: markAsPaid,
        },
        {
          '__typename': true,
          '...on MutationUpsertRegistrationSuccess': {
            data: {
              paid: true,
            },
          },
          '...on Error': {
            message: true,
          },
        },
      ],
    });
    if (upsertRegistration.__typename !== 'Error') {
      registrations.edges[
        registrations.edges.findIndex((r) => r.node.id === registration.id)
      ].node.paid = upsertRegistration.data.paid;
    }
  }

  $: compare = compareRegistrations($sort.by, $sort.direction);
  $: void submitSearchQuery($searchQuery);
  $: displayedRegistrations = (
    $searchQuery && !loadingSearchResults ? searchResults : registrations
  ).edges.sort((a, b) => compare(a.node, b.node) || a.node.id.localeCompare(b.node.id));
</script>

<header>
  <h1>{registrationsCounts.total} Réservations</h1>
  <section class="counts">
    {registrationsCounts.paid} payées · {registrationsCounts.verified} scannées · {registrationsCounts.unpaidLydia}
    Lydias non payées <br />
    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
      profitsBreakdown.total,
    )} de ventes
  </section>

  <div class="search">
    <form
      on:submit|preventDefault={async () => {
        await submitSearchQuery($searchQuery);
      }}
    >
      <InputText
        label=""
        actionIcon={$searchQuery ? IconClear : undefined}
        on:action={() => {
          $searchQuery = '';
        }}
        placeholder="Bénéficiaire, nom de ticket,..."
        bind:value={$searchQuery}
      >
        <span slot="before"><IconSearch></IconSearch></span>
      </InputText>
    </form>
  </div>

  {#if newRegistrationsSinceLoad > 0}
    <Alert>
      {newRegistrationsSinceLoad} nouvelles réservations. <ButtonInk
        icon={IconRefresh}
        on:click={async () => {
          const newData = await $zeus.query({
            registrationsOfEvent: [
              { groupUid: $page.params.group, eventUid: $page.params.uid },
              _registrationsQuery,
            ],
            event: [
              { groupUid: $page.params.group, uid: $page.params.uid },
              {
                registrationsCounts: {
                  total: true,
                },
              },
            ],
          });
          data.registrationsOfEvent = newData.registrationsOfEvent;
          initialRegistrationsTotalCount = newData.event.registrationsCounts.total;
          newRegistrationsSinceLoad = 0;
        }}>Afficher</ButtonInk
      >
    </Alert>
  {/if}

  <div class="actions">
    {#await csv()}
      <ButtonSecondary icon={IconDownload} loading>Exporter en .csv</ButtonSecondary>
    {:then csvContents}
      <ButtonSecondary
        disabled={Boolean(csvExportError)}
        help={csvExportError}
        icon={IconDownload}
        href="data:application/octet-stream;charset=utf-8,{encodeURIComponent(csvContents ?? '')}"
        download={`reservations-${$page.params.group}-${$page.params.uid}-${format(
          new Date(),
          "yyyy-MM-dd-HH'h'mm",
        )}.csv`}>Exporter en .csv</ButtonSecondary
      >
    {/await}
    <InputCheckbox label="Vue compacte" bind:value={compact} />
    {#if registrations.pageInfo.hasNextPage}
      <ButtonSecondary
        help={`${registrations.edges.length}/${registrationsCounts.total} chargées`}
        on:click={loadMore}
        loading={loadingMore}>Charger plus</ButtonSecondary
      >
    {/if}
  </div>
</header>

<div class="table-scroller">
  <table class:compact>
    <thead>
      <tr>
        <th />
        {#each COLUMNS as [key, label] (key)}
          <th
            class:sorting={$sort.by === key}
            on:click={() => {
              $sort.by = key;
              $sort.direction = $sort.direction === 'ascending' ? 'descending' : 'ascending';
            }}
            ><div class="inner">
              {label}
              <div class="sort-icon">
                {#if $sort.by === key}
                  {#if $sort.direction === 'ascending'}
                    <IconSortUp />
                  {:else}
                    <IconSortDown />
                  {/if}
                {/if}
              </div>
            </div>
          </th>
        {/each}
        <th />
      </tr>
    </thead>
    <tbody>
      {#if loadingSearchResults}
        <tr><td colspan={COLUMNS.length + 1}><LoadingSpinner></LoadingSpinner></td></tr>
      {:else}
        {#each displayedRegistrations as { node: registration, node: { paid, id, beneficiary, authorEmail, ticket, beneficiaryUser, author, authorIsBeneficiary, createdAt, paymentMethod, verifiedAt, verifiedBy, opposed, opposedAt, opposedBy, cancelled, cancelledAt, cancelledBy } } (id)}
          {@const benef = beneficiaryUser ?? (authorIsBeneficiary ? author : undefined)}
          {@const code = id.replace(/^r:/, '').toUpperCase()}
          <tr class:selected={rowIsSelected[id]}>
            <td class="actions">
              <InputCheckbox bind:value={rowIsSelected[id]} label="" />
            </td>
            <td>
              {#if isSameDay(createdAt, new Date())}
                {format(createdAt, 'HH:mm')}
              {:else}
                {formatDateTime(createdAt)}
              {/if}
            </td>
            <td
              class="centered"
              class:danger={opposed || cancelled}
              class:success={paid && verifiedAt}
              class:warning={!paid}
              use:tooltip={opposedAt || verifiedAt || cancelledAt
                ? (opposedAt
                    ? `Opposée le ${formatDateTime(opposedAt)} par ${opposedBy?.fullName ?? '?'}`
                    : '') +
                  (verifiedAt ? ', ' : '') +
                  (verifiedAt
                    ? `Scannée le ${formatDateTime(verifiedAt)} par ${verifiedBy?.fullName ?? '?'}`
                    : '') +
                  (cancelledAt ? ', ' : '') +
                  (cancelledAt
                    ? `Annulée le ${formatDateTime(cancelledAt)} par ${
                        cancelledBy?.fullName ?? '?'
                      }`
                    : '')
                : paid
                  ? 'Payée'
                  : 'Non payée'}
            >
              {#if opposed}
                <IconOpposed />
              {:else if cancelledAt}
                <IconCancel />
              {:else if verifiedAt && paid}
                <IconCheck />
              {:else if paid}
                <IconCash />
              {:else}
                <IconCashOff />
              {/if}
            </td>
            <td
              class="centered"
              use:tooltip={paymentMethod ? DISPLAY_PAYMENT_METHODS[paymentMethod] : 'Inconnue'}
            >
              <svelte:component this={PAYMENT_METHODS_ICONS[paymentMethod ?? 'Other']} />
            </td>
            <td>
              {#if ticket.group}
                {ticket.group.name} <IconChevronRight />
              {/if}
              {ticket.name}
            </td>
            {#if benef}
              <td>
                {#if compact}
                  <a href="/users/{benef.uid}">{benef.fullName}</a>
                {:else}
                  <AvatarPerson href="/users/{benef.uid}" {...benef} />
                {/if}
              </td>
              <td class="centered">
                {#if benef.contributesTo.length > 0}
                  {#if compact && benef.contributesTo.find(({ name }) => name === 'AEn7')}
                    <IconCheck />
                  {:else}
                    {benef.contributesTo.map(({ name }) => name).join(', ')}
                  {/if}
                {:else}
                  <IconClose />
                {/if}
              </td>
              <td class="centered">
                {benef.major?.shortName ?? ''}
              </td>
              <td class="centered">
                {benef.yearTier}A
              </td>
            {:else}
              <td colspan="4">{beneficiary || authorEmail} <Badge>exté</Badge> </td>
            {/if}
            <td>
              {#if !authorIsBeneficiary}
                {#if author}
                  {#if compact}
                    <a href="/users/{author.uid}">{author.fullName}</a>
                  {:else}
                    <AvatarPerson href="/users/{author.uid}" {...author} />
                  {/if}
                {:else}
                  {authorEmail}
                {/if}
              {/if}
            </td>
            <td class="centered">
              <a href="/bookings/{code}?utm_source=event-page"><code>{code}</code></a>
            </td>
            <td class="actions">
              <ButtonGhost
                danger={paid}
                success={!paid}
                help={'Marquer comme ' + (paid ? 'non payée' : 'payée')}
                on:click={async () => updatePaidStatus(!paid, registration)}
              >
                {#if paid}
                  <IconCashOff />
                {:else}
                  <IconCash />
                {/if}
              </ButtonGhost>
              {#if !verifiedAt}
                <ButtonGhost
                  danger={Boolean(verifiedAt)}
                  success={!verifiedAt}
                  help={'Vérifier la réservation'}
                  on:click={async () => {
                    await updatePaidStatus(true, registration);
                    const { verifyRegistration } = await $zeus.mutate({
                      verifyRegistration: [
                        {
                          eventUid: $page.params.uid,
                          groupUid: $page.params.group,
                          id,
                        },
                        {
                          '__typename': true,
                          '...on Error': {
                            message: true,
                          },
                          '...on MutationVerifyRegistrationSuccess': {
                            data: {
                              registration: {
                                paid: true,
                                verifiedAt: true,
                                verifiedBy: {
                                  uid: true,
                                  pictureFile: true,
                                  fullName: true,
                                },
                              },
                            },
                          },
                        },
                      ],
                    });

                    if (verifyRegistration.__typename === 'Error') {
                      toasts.error(`Impossible de vérifier ${id}`, verifyRegistration.message);
                      return;
                    }

                    if (verifyRegistration.__typename === 'MutationVerifyRegistrationSuccess') {
                      registrations.edges[
                        registrations.edges.findIndex((r) => r.node.id === registration.id)
                      ].node.verifiedAt = verifyRegistration.data.registration?.verifiedAt;
                      registrations.edges[
                        registrations.edges.findIndex((r) => r.node.id === registration.id)
                      ].node.verifiedBy = verifyRegistration.data.registration?.verifiedBy;
                    }
                  }}
                >
                  <IconCheck />
                </ButtonGhost>
              {/if}
              {#if !opposed}
                <ButtonGhost
                  danger
                  help={'Opposer la réservation'}
                  on:click={async () => {
                    await oppose(registration);
                  }}
                >
                  <IconOpposed />
                </ButtonGhost>
              {/if}
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan={COLUMNS.length + 1}
              >{#if searchQuery}Aucun résultat{:else}
                Aucune réservation pour le moment.{/if}</td
            >
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>

  {#if !searchQuery && registrations.pageInfo.hasNextPage}
    <section class="load-more">
      <ButtonSecondary
        help={`${displayedRegistrations.length}/${registrationsCounts.total} chargées`}
        on:click={loadMore}
        loading={loadingMore}>Charger plus</ButtonSecondary
      >
    </section>
  {/if}
</div>

<style lang="scss">
  header {
    margin: 0 auto;
    margin-bottom: 2rem;
    text-align: center;
  }

  header .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    align-items: center;
    justify-content: center;
  }

  header .search {
    max-width: 600px;
    margin: 0 auto 1rem;
  }

  header h1 {
    padding-bottom: 0;
    margin-top: 2rem;
    margin-bottom: 0.25rem;
  }

  section.counts {
    margin-bottom: 2rem;
  }

  .table-scroller {
    overflow-x: auto;
  }

  table {
    --spacing: 1.5rem;

    max-width: 100vw;
    margin: 0 auto;
    overflow-y: scroll;
    border-spacing: calc(max(0.5rem, var(--spacing) / 2));
    border-collapse: separate;
  }

  table.compact {
    --spacing: 0.5rem;

    border-spacing: var(--border-block);
  }

  .sort-icon {
    display: inline-block;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
  }

  th .inner {
    display: flex;
    align-items: center;
  }

  table,
  th,
  td {
    border-color: var(--bg);
  }

  td,
  th {
    padding: calc(max(0.5rem, var(--spacing) / 2));
    text-align: left;
  }

  th {
    padding-top: 0;
    padding-bottom: 0;
  }

  td {
    background: var(--muted-bg);
  }

  td.danger,
  td.success {
    color: var(--text);
    background: var(--bg);
  }

  table:not(.compact) td {
    border-radius: var(--radius-inline);
  }

  tr.selected td:not(.actions) {
    background: var(--muted-border);
    border-right-color: var(--muted-border);
    border-left-color: var(--muted-border);
  }

  tr.selected:first-child td {
    border-top-color: transparent;
  }

  td[colspan],
  td.centered {
    text-align: center;
  }

  td.actions {
    width: max-content;
    padding: 0.25rem 1rem;
    background: transparent;
  }

  .load-more {
    display: flex;
    justify-content: center;
    margin: 2rem 0;
  }
</style>
