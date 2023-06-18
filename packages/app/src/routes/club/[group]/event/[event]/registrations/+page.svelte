<script lang="ts">
  import Button from '$lib/components/buttons/Button.svelte';
  import Tabs from '$lib/components/navigation/Tabs.svelte';
  import type { PageData } from './$types';
  import * as jsonToCsv from 'json-to-csv-in-browser';
  import { page } from '$app/stores';
  import { dateTimeFormatter } from '$lib/dates';
  import { intlFormatDistance } from 'date-fns';

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
              author: { firstName, lastName },
              paid,
              paymentMethod,
              ticket
            }
          }) => ({
            'Date de réservation': dateTimeFormatter.format(createdAt),
            Bénéficiaire: beneficiary,
            'Achat par': `${firstName} ${lastName}`,
            Payée: paid ? 'Oui' : 'Non',
            'Méthode de paiement': paymentMethod,
            Billet: ticket.name
          })
        )
      ).convertToCSVstring()
    );
  }

  export let data: PageData;
  let { registrationsOfEvent: registrations } = data;

  const CATEGORIES = [
    'En attente de paiement',
    'Payées',
    'Validées',
    'Refusées',
    'En attente de remboursement',
    'Remboursées'
  ] as const;

  let registrationsByCategory = {
    'En attente de paiement': [],
    Payées: [],
    Validées: [],
    Refusées: [],
    'En attente de remboursement': [],
    Remboursées: []
  } as unknown as Record<
    typeof CATEGORIES[number],
    Array<{
      paid: boolean;
      createdAt: Date;
      beneficiary: string;
      author: { uid: string; firstName: string; lastName: string };
    }>
  >;

  function updateRegistrationsByCategory(
    registrations: typeof registrationsByCategory[typeof CATEGORIES[number]]
  ) {
    if (!registrations) return;

    registrationsByCategory['En attente de paiement'] = registrations.filter((r) => !r.paid) ?? [];
    registrationsByCategory['Payées'] = registrations.filter((r) => r.paid) ?? [];
  }

  $: updateRegistrationsByCategory(registrations?.edges.map(({ node }) => node));
</script>

<Tabs
  tabs={[
    { name: 'Infos', href: `../edit` },
    { name: 'Réservations', href: '.' },
    { name: 'Vérifier', href: '../scan' }
  ]}
/>

<h1>{registrations?.edges.length} Réservations</h1>

<Button on:click={() => saveAsCsv()}>Exporter en .csv</Button>

{#each CATEGORIES as category}
  <h2>{category}</h2>

  <ul>
    {#each registrationsByCategory[category] as registration}
      <li>
        {dateTimeFormatter.format(registration.createdAt)} &bull; {intlFormatDistance(
          registration.createdAt,
          new Date()
        )} &bull;
        {registration.author.firstName}
        {registration.author.lastName} pour {registration.beneficiary}
      </li>
    {/each}
  </ul>
{/each}
