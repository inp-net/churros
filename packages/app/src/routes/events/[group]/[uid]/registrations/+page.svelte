<script lang="ts">
  import IconDownload from '~icons/mdi/download-outline';
  import type { PageData } from './$types';
  import * as jsonToCsv from 'json-to-csv-in-browser';
  import IconCheck from '~icons/mdi/check';
  import IconCancel from '~icons/mdi/cancel';
  import IconClose from '~icons/mdi/close';
  import { page } from '$app/stores';
  import { dateTimeFormatter, formatDateTime } from '$lib/dates';
  import { format, isSameDay } from 'date-fns';
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

  async function updatePaidStatus(
    markAsPaid: boolean,
    registration: (typeof registrations.edges)[number]['node']
  ): Promise<void> {
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

<table class:compact>
  <thead>
    <tr>
      <th />
      <th>Date</th>
      <th>État</th>
      <th>Méthode</th>
      <th>Bénéficiaire</th>
      <th>Cotise</th>
      <th>Filière</th>
      <th>Année</th>
      <th>Payé par</th>
      <th />
    </tr>
  </thead>
  <tbody>
    {#each registrations.edges as { node: registration, node: { paid, id, beneficiary, beneficiaryUser, author, authorIsBeneficiary, createdAt, paymentMethod } }}
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
              {benef.contributesTo.map(({ name }) => name).join(', ')}
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
    {/each}
  </tbody>
</table>

<style lang="scss">
  table {
    --spacing: 1.5rem;
    border-collapse: separate;
    border-spacing: calc(max(0.5rem, var(--spacing) / 2));
    margin: 0 auto;
    overflow-y: scroll;
    max-width: 100vw;
  }
  table.compact {
    --spacing: 0.5rem;
    border-spacing: var(--border-block);
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
    text-align: center;
    margin: 0 auto;
    margin-bottom: 2rem;
  }
  header h1 {
    margin: 1rem 0;
  }
  header .actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
  }

  tr.selected td:not(.actions) {
    background: var(--muted-border);
    border-left-color: var(--muted-border);
    border-right-color: var(--muted-border);
  }
  tr.selected:first-child td {
    border-top-color: transparent;
  }

  td[colspan],
  td.centered {
    text-align: center;
  }
  td.actions {
    background: transparent;
    padding: 0.25rem 1rem;
  }
</style>
