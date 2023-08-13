<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import type { PageData } from './$types';
  import * as jsonToCsv from 'json-to-csv-in-browser';
  import IconCheck from '~icons/mdi/check';
  import IconCancel from '~icons/mdi/cancel';
  import { page } from '$app/stores';
  import { dateTimeFormatter } from '$lib/dates';
  import { intlFormatDistance } from 'date-fns';
  import { type PaymentMethod, zeus } from '$lib/zeus';

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

  const CATEGORIES = [
    'En attente de paiement',
    'Payées',
    'Validées',
    'Refusées',
    'En attente de remboursement',
    'Remboursées',
  ] as const;

  const registrationsByCategory = {
    'En attente de paiement': [],
    Payées: [],
    Validées: [],
    Refusées: [],
    'En attente de remboursement': [],
    Remboursées: [],
  } as unknown as Record<
    typeof CATEGORIES[number],
    Array<{
      paid: boolean;
      createdAt: Date;
      beneficiary: string;
      id: string;
      paymentMethod?: PaymentMethod | undefined;
      author: { uid: string; firstName: string; lastName: string };
      ticket: { id: string; name: string };
    }>
  >;

  function updateRegistrationsByCategory(
    registrations: typeof registrationsByCategory[typeof CATEGORIES[number]]
  ) {
    if (!registrations) return;

    registrationsByCategory['En attente de paiement'] = registrations.filter((r) => !r.paid) ?? [];
    registrationsByCategory['Payées'] = registrations.filter((r) => r.paid) ?? [];
  }

  async function updatePaidStatus(
    markAsPaid: boolean,
    registration: typeof registrationsByCategory[typeof CATEGORIES[number]][number]
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

  $: updateRegistrationsByCategory(registrations?.edges.map(({ node }) => node));
</script>

<h1>{registrations?.edges.length} Réservations</h1>

<Button
  on:click={() => {
    saveAsCsv();
  }}>Exporter en .csv</Button
>

{#each CATEGORIES as category}
  <h2>{category}</h2>

  <ul>
    {#each registrationsByCategory[category] as registration (registration.id)}
      <li>
        {dateTimeFormatter.format(registration.createdAt)} &bull; {intlFormatDistance(
          registration.createdAt,
          new Date()
        )} &bull;
        {registration.ticket.name}
        &bull;
        {registration.author.firstName}
        {registration.author.lastName} pour {registration.beneficiary}
        {#if category === 'En attente de paiement'}
          <Button
            on:click={async () => {
              await updatePaidStatus(true, registration);
            }}><IconCheck /> Payée</Button
          >
        {:else}
          <Button
            on:click={async () => {
              await updatePaidStatus(false, registration);
            }}><IconCancel /> Non payée</Button
          >
        {/if}
      </li>
    {/each}
  </ul>
{/each}
