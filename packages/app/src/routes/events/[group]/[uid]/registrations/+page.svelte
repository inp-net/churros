<script lang="ts">
  import IconDownload from '~icons/mdi/download-outline';
  import IconMarkAsPaid from '~icons/mdi/currency-usd';
  import IconMarkAsUnpaid from '~icons/mdi/currency-usd-off';
  import type { PageData } from './$types';
  import * as jsonToCsv from 'json-to-csv-in-browser';
  import IconCheck from '~icons/mdi/check';
  import IconClose from '~icons/mdi/close';
  import IconSortUp from '~icons/mdi/triangle-small-up';
  import IconChevronRight from '~icons/mdi/chevron-right';
  import IconSortDown from '~icons/mdi/triangle-small-down';
  import { page } from '$app/stores';
  import { dateTimeFormatter, formatDateTime } from '$lib/dates';
  import { compareAsc, compareDesc, format, isSameDay } from 'date-fns';
  import { zeus } from '$lib/zeus';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { DISPLAY_PAYMENT_METHODS, PAYMENT_METHODS_ICONS } from '$lib/display';
  import Badge from '$lib/components/Badge.svelte';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import { _registrationsQuery } from './+page';
  import { afterNavigate } from '$app/navigation';
  import { tooltip } from '$lib/tooltip';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';

  let compact = false;
  let loadingMore = false;

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

  function humanBoolean(value: boolean): string {
    return value ? 'Oui' : 'Non';
  }

  function saveAsCsv() {
    if (!registrations) return;
    jsonToCsv.download(
      `reservations-${$page.params.group}-${$page.params.uid}-${format(
        new Date(),
        "yyyy-MM-dd-HH'h'mm"
      )}.csv`,
      new jsonToCsv.JsonArray(
        registrations.edges.map(
          ({
            node: {
              createdAt,
              beneficiary,
              authorIsBeneficiary,
              beneficiaryUser,
              author,
              paid,
              paymentMethod,
              ticket,
              id,
              verifiedAt,
            },
          }) => {
            const benef = beneficiaryUser ?? (authorIsBeneficiary ? author : undefined);
            return {
              'Date de réservation': dateTimeFormatter.format(createdAt),
              Bénéficiaire: benef?.fullName ?? beneficiary,
              'Achat par': author.fullName,
              Payée: humanBoolean(paid),
              Scannée: humanBoolean(Boolean(verifiedAt) && paid),
              'Méthode de paiement': paymentMethod,
              Billet: ticket.name,
              Cotisant: benef
                ? humanBoolean(
                    benef.contributesTo.includes((c: { name: string }) => c.name === 'AEn7')
                  )
                : '',
              Filière: benef?.major.shortName ?? '',
              Année: benef ? benef.yearTier.toString() + 'A' : '',
              Promo: benef?.graduationYear ?? '',
              'Code de réservation': id.replace(/^r:/, '').toUpperCase(),
              'Lien vers la place': `https://${window.location.host}/bookings/${id.replace(
                /^r:/,
                ''
              )}/`,
            };
          }
        )
      ).convertToCSVstring()
    );
  }

  export let data: PageData;
  const {
    registrationsOfEvent: registrations,
    event: { registrationsCounts },
  } = data;
  const rowIsSelected = Object.fromEntries(registrations.edges.map(({ node }) => [node.id, false]));

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

  function fromSortingQueryParam(sorting: string): [typeof sortBy, typeof sortDirection] {
    // If sorting starts with "-", it's descending, if it starts with "+" (or nothing), it's ascending
    const desc = sorting.startsWith('-');
    const key = sorting.replace(/^-+/, '');
    return [key as typeof sortBy, desc ? 'descending' : 'ascending'];
  }

  function toSortingQueryParam(
    sortBy: (typeof COLUMNS)[number][0],
    direction: typeof sortDirection
  ) {
    return `${direction === 'descending' ? '-' : ''}${sortBy}`;
  }

  let sortBy: (typeof COLUMNS)[number][0] = 'date';
  let sortDirection: 'ascending' | 'descending' = 'descending';

  afterNavigate(() => {
    [sortBy, sortDirection] = fromSortingQueryParam($page.url.searchParams.get('sort') ?? '-date');
  });

  type Registration = (typeof registrations.edges)[number]['node'];

  function compareRegistrations(
    sortBy: (typeof COLUMNS)[number][0],
    sortDirection: 'ascending' | 'descending'
  ): (a: Registration, b: Registration) => number {
    const desc = sortDirection === 'descending';
    const benefUser = (r: Registration) =>
      r.beneficiaryUser ?? (r.authorIsBeneficiary ? r.author : undefined);
    switch (sortBy) {
      case 'date': {
        return (a, b) => (desc ? compareDesc : compareAsc)(a.createdAt, b.createdAt);
      }

      case 'state': {
        const sortingIndex = (a: Registration) => (a.verifiedAt && a.paid ? 0 : a.paid ? 1 : 2);
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
        return (a, b) => (desc ? -1 : 1) * a.author.fullName.localeCompare(b.author.fullName);
      }

      case 'graduationYear': {
        return (a, b) =>
          (desc ? -1 : 1) *
          ((benefUser(b)?.graduationYear ?? Number.POSITIVE_INFINITY) -
            (benefUser(a)?.graduationYear ?? Number.POSITIVE_INFINITY));
      }

      case 'major': {
        const major = (r: Registration) => benefUser(r)?.major.shortName ?? '';
        return (a, b) => major(a).localeCompare(major(b));
      }

      default: {
        return (a, b) => a.id.localeCompare(b.id);
      }
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
          __typename: true,
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

  $: compare = compareRegistrations(sortBy, sortDirection);
</script>

<header>
  <h1>{registrationsCounts.total} Réservations</h1>
  <section class="counts">
    {registrationsCounts.paid} payées · {registrationsCounts.verified} scannées · {registrationsCounts.unpaidLydia}
    Lydias non payées
  </section>

  <div class="actions">
    <ButtonSecondary
      icon={IconDownload}
      help={registrations.pageInfo.hasNextPage
        ? "Attention, charge toutes les réservations sinon l'export sera incomplet"
        : ''}
      on:click={() => {
        saveAsCsv();
      }}>Exporter en .csv</ButtonSecondary
    >
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
            class:sorting={sortBy === key}
            on:click={() => {
              $page.url.searchParams.set(
                'sort',
                toSortingQueryParam(
                  key,
                  sortBy === key
                    ? sortDirection === 'ascending'
                      ? 'descending'
                      : 'ascending'
                    : 'ascending'
                )
              );
              window.history.pushState(undefined, '', $page.url.href);
              [sortBy, sortDirection] = fromSortingQueryParam(
                $page.url.searchParams.get('sort') ?? '-date'
              );
            }}
            ><div class="inner">
              {label}
              <div class="sort-icon">
                {#if sortBy === key}
                  {#if sortDirection === 'ascending'}
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
      {#each registrations.edges.sort((a, b) => compare(a.node, b.node) || a.node.id.localeCompare(b.node.id)) as { node: registration, node: { paid, id, beneficiary, ticket, beneficiaryUser, author, authorIsBeneficiary, createdAt, paymentMethod, verifiedAt, verifiedBy } } (id)}
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
            use:tooltip={verifiedAt
              ? `Scannée le ${formatDateTime(verifiedAt)} par ${verifiedBy?.fullName ?? '?'}`
              : undefined}
          >
            {verifiedAt && paid ? 'Scannée' : paid ? 'Payée' : 'Non payée'}
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
              {benef.major.shortName ?? ''}
            </td>
            <td class="centered">
              {benef.yearTier}A
            </td>
          {:else}
            <td colspan="4">{beneficiary} <Badge>exté</Badge> </td>
          {/if}
          <td>
            {#if !authorIsBeneficiary}
              {#if compact}
                <a href="/users/{author.uid}">{author.fullName}</a>
              {:else}
                <AvatarPerson href="/users/{author.uid}" {...author} />
              {/if}
            {/if}
          </td>
          <td class="centered">
            <a href="/bookings/{code}/"><code>{code}</code></a>
          </td>
          <td class="actions">
            <ButtonGhost
              danger={paid}
              success={!paid}
              help={'Marquer comme ' + (paid ? 'non payée' : 'payée')}
              on:click={async () => updatePaidStatus(!paid, registration)}
            >
              {#if paid} <IconMarkAsUnpaid /> {:else} <IconMarkAsPaid /> {/if}
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
                        __typename: true,
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
                    console.error(verifyRegistration.message);
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
          </td>
        </tr>
      {:else}
        <tr>
          <td colspan="10">Aucune réservation pour le moment.</td>
        </tr>
      {/each}
    </tbody>
  </table>

  {#if registrations.pageInfo.hasNextPage}
    <section class="load-more">
      <ButtonSecondary
        help={`${registrations.edges.length}/${registrationsCounts.total} chargées`}
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
