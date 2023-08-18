<script lang="ts">
  import IconDownload from '~icons/mdi/download-outline';
  import type { PageData } from './$types';
  import * as jsonToCsv from 'json-to-csv-in-browser';
  import IconCheck from '~icons/mdi/check';
  import IconCancel from '~icons/mdi/cancel';
  import IconClose from '~icons/mdi/close';
  import IconSortUp from '~icons/mdi/triangle-small-up';
  import IconSortDown from '~icons/mdi/triangle-small-down';
  import { page } from '$app/stores';
  import { dateTimeFormatter, formatDateTime } from '$lib/dates';
  import { compareAsc, compareDesc, format, isSameDay } from 'date-fns';
  import { zeus } from '$lib/zeus';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { DISPLAY_PAYMENT_METHODS } from '$lib/display';
  import Badge from '$lib/components/Badge.svelte';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';

  let compact = false;

  function saveAsCsv() {
    if (!registrations) return;
    jsonToCsv.download(
      `reservations-${$page.params.event}.csv`,
      new jsonToCsv.JsonArray(
        registrations.edges.map(
          ({
            node: {
              createdAt,
              beneficiary,
              author: { fullName },
              paid,
              paymentMethod,
              ticket,
            },
          }) => ({
            'Date de réservation': dateTimeFormatter.format(createdAt),
            Bénéficiaire: beneficiary,
            'Achat par': fullName,
            Payée: paid ? 'Oui' : 'Non',
            'Méthode de paiement': paymentMethod,
            Billet: ticket.name,
          })
        )
      ).convertToCSVstring()
    );
  }

  export let data: PageData;
  const { registrationsOfEvent: registrations } = data;
  const rowIsSelected = Object.fromEntries(registrations.edges.map(({ node }) => [node.id, false]));

  const COLUMNS = [
    ['date', 'Date'],
    ['state', 'État'],
    ['method', 'Méthode'],
    ['beneficiary', 'Bénéficiaire'],
    ['contributes', 'Cotise'],
    ['major', 'Filière'],
    ['graduationYear', 'Année'],
    ['author', 'Payé par'],
  ] as const;

  let sortBy: (typeof COLUMNS)[number][0] = 'date';
  let sortDirection: 'ascending' | 'descending' = 'descending';

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
        return (a, _) => (desc ? -1 : 1) * (a.paid ? 1 : -1);
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
  <h1>{registrations?.edges.length} Réservations</h1>

  <div class="actions">
    <ButtonSecondary
      icon={IconDownload}
      on:click={() => {
        saveAsCsv();
      }}>Exporter en .csv</ButtonSecondary
    >
    <InputCheckbox label="Vue compacte" bind:value={compact} />
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
              if (sortBy === key) 
                sortDirection = sortDirection === 'ascending' ? 'descending' : 'ascending';
               else 
                sortBy = key;
              
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
      {#each registrations.edges.sort((a, b) => compare(a.node, b.node) || a.node.id.localeCompare(b.node.id)) as { node: registration, node: { paid, id, beneficiary, beneficiaryUser, author, authorIsBeneficiary, createdAt, paymentMethod } } (id)}
        {@const benef = beneficiaryUser ?? (authorIsBeneficiary ? author : undefined)}
        <tr class:selected={rowIsSelected[id]}>
          <td class="actions">
            <InputCheckbox bind:value={rowIsSelected[id]} label="" />
          </td>
          <td>
            {#if isSameDay(createdAt, new Date())}
              {format(createdAt, 'HH:MM')}
            {:else}
              {formatDateTime(createdAt)}
            {/if}
          </td>
          <td>
            {paid ? 'Payée' : 'Non payée'}
          </td>
          <td>
            {paymentMethod ? DISPLAY_PAYMENT_METHODS[paymentMethod] : 'Inconnue'}
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
          <td class="actions">
            <ButtonSecondary
              danger={paid}
              on:click={async () => updatePaidStatus(!paid, registration)}
            >
              {#if compact}
                {#if paid} <IconCancel /> {:else} <IconCheck /> {/if}
              {:else if paid}
                <IconCancel /> Non payée{:else}
                <IconCheck /> Payée{/if}
            </ButtonSecondary>
          </td>
        </tr>
      {:else}
        <tr>
          <td colspan="10">Aucune réservation pour le moment.</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style lang="scss">
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
    width: 2rem;
    height: 2rem;
    display: inline-block;
    display: flex;
    align-items: center;
    justify-content: center;
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

  td {
    background: var(--muted-bg);
  }

  table:not(.compact) td {
    border-radius: var(--radius-inline);
  }

  header {
    margin: 0 auto;
    margin-bottom: 2rem;
    text-align: center;
  }

  header h1 {
    margin: 1rem 0;
  }

  header .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    align-items: center;
    justify-content: center;
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
    padding: 0.25rem 1rem;
    background: transparent;
  }
</style>
