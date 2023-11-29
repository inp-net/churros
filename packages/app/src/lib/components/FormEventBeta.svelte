<script lang="ts" context="module">
  export const defaultTicket: (
    event: Pick<Event, 'tickets' | 'startsAt' | 'endsAt'>,
    id: string,
  ) => Ticket = (event, id) => ({
    allowedPaymentMethods: ['Cash', 'Lydia'] as PaymentMethod[],
    capacity: 0,
    price: 0,
    closesAt: event.tickets.length > 0 ? event.tickets[0].closesAt : event.endsAt ?? new Date(),
    opensAt:
      event.tickets.length > 0
        ? event.tickets[0].opensAt
        : new Date((event.startsAt ?? new Date()).valueOf() - 1 * 24 * 3600 * 1e3),
    description: '',
    godsonLimit: 0,
    links: [],
    name: '',
    onlyManagersCanProvide: false,
    // eslint-disable-next-line unicorn/no-null
    openToAlumni: null,
    openToExternal: false,
    openToGroups: [],
    // eslint-disable-next-line unicorn/no-null
    openToContributors: null,
    openToPromotions: [],
    openToSchools: [],
    openToMajors: [],
    autojoinGroups: [],
    // eslint-disable-next-line unicorn/no-null
    openToApprentices: null,
    id,
  });
  export function shadowId() {
    return '::' + nanoid(10);
  }

  export function eraseShadowIds(...things: Array<{ id: string }>) {
    return things.map((t) => ({
      ...t,
      id: t.id.startsWith('::') ? '' : t.id,
    }));
  }
  export type Ticket = {
    id: string;
    name: string;
    description: string;
    price: number;
    capacity: number;
    opensAt?: Date | undefined;
    closesAt?: Date | undefined;
    links: Array<{ name: string; value: string }>;
    allowedPaymentMethods: PaymentMethod[];
    openToPromotions: number[];
    openToExternal?: boolean | null | undefined;
    openToAlumni?: boolean | null | undefined;
    openToSchools: Array<{ name: string; id: string; uid: string }>;
    openToGroups: Array<{
      id: string;
      name: string;
      uid: string;
      pictureFile: string;
      pictureFileDark: string;
    }>;
    openToMajors: Array<{ name: string; shortName: string; id: string }>;
    openToContributors?: boolean | null | undefined;
    openToApprentices?: boolean | null | undefined;
    godsonLimit: number;
    onlyManagersCanProvide: boolean;
    autojoinGroups: Array<{
      id: string;
      name: string;
      uid: string;
      pictureFile: string;
      pictureFileDark: string;
    }>;
  };

  export type Event = {
    pictureFile: string;
    id: string;
    contactMail: string;
    beneficiary?:
      | undefined
      | {
          name: string;
          id: string;
          group?:
            | undefined
            | {
                pictureFile: string;
                pictureFileDark: string;
                name: string;
              };
        };
    description: string;
    endsAt?: Date | undefined;
    links: Array<{ name: string; value: string }>;
    location: string;
    uid: string;
    startsAt?: Date | undefined;
    title: string;
    visibility: Visibility;
    frequency: EventFrequency;
    recurringUntil?: Date | undefined;
    group: {
      id: string;
      uid: string;
      name: string;
      pictureFile: string;
      pictureFileDark: string;
      studentAssociation?: { school: { name: string } };
      children: Array<{
        name: string;
        studentAssociation?: { school: { name: string } };
      }>;
    };
    coOrganizers: Array<{
      id: string;
      uid: string;
      name: string;
      pictureFile: string;
      pictureFileDark: string;
      studentAssociation?: { school: { name: string } };
      children: Array<{
        name: string;
        studentAssociation?: { school: { name: string } };
      }>;
    }>;
    managers: Array<{
      user: {
        uid: string;
        firstName: string;
        lastName: string;
        pictureFile: string;
        fullName: string;
      };
      canEdit: boolean;
      canEditPermissions: boolean;
      canVerifyRegistrations: boolean;
    }>;
    bannedUsers: Array<{
      uid: string;
      firstName: string;
      lastName: string;
      pictureFile: string;
      fullName: string;
    }>;
    tickets: Ticket[];
    ticketGroups: Array<{
      id: string;
      name: string;
      capacity: number;
      tickets: Ticket[];
    }>;
  };
</script>

<script lang="ts">
  import { Visibility, EventFrequency, zeus, PaymentMethod } from '$lib/zeus';
  import { addDays } from 'date-fns';
  import IconNext from '~icons/mdi/chevron-right';
  import IconClose from '~icons/mdi/close';
  import ButtonGhost from './ButtonGhost.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import FormEventBetaStepDetails from './FormEventBetaStepDetails.svelte';
  import Modal from './Modal.svelte';
  import NavigationSteps from './NavigationSteps.svelte';
  import FormEventBetaStepCommunication from './FormEventBetaStepSituation.svelte';
  import FormEventBetaStepOrganization from './FormEventBetaStepOrganization.svelte';
  import LoadingSpinner from './LoadingSpinner.svelte';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import FormEventBetaStepTickets from './FormEventBetaStepTickets.svelte';
  import { onMount } from 'svelte';
  import { nanoid } from 'nanoid';

  export let modalElement: HTMLDialogElement;

  export let event: Event = {
    title: 'Quoicoubaka',
    description: '',
    startsAt: new Date(),
    endsAt: addDays(new Date(), 1),
    frequency: EventFrequency.Once,
    ticketGroups: [],
    tickets: [
      {
        ...defaultTicket(
          { tickets: [], startsAt: new Date(), endsAt: addDays(new Date(), 1) },
          shadowId(),
        ),
        name: 'ogziogrjoirz',
      },
      {
        ...defaultTicket(
          { tickets: [], startsAt: new Date(), endsAt: addDays(new Date(), 1) },
          shadowId(),
        ),
        name: 'greoigjroiger',
      },
    ],
  };

  let steps: Array<readonly [string, string]> = [
    ['details', 'Détails'],
    ['situation', 'Situation'],
    ['tickets', 'Billets'],
    ['organization', 'Organisation'],
    ['visibility', 'Visibilité'],
  ];

  const stepIndex = (id: string) => steps.findIndex(([href, _]) => href === id);

  let currentStep = 'tickets';

  function nextStepOrSubmit() {
    if (currentStep === 'visibility') {
      modalElement.close();
    } else {
      currentStep = steps[stepIndex(currentStep) + 1][0];
    }
  }

  let scrolled = false;

  onMount(() => {
    modalElement.addEventListener('scroll', () => {
      scrolled = modalElement.scrollTop > 0;
    });
  });
</script>

<Modal open noPadding class="form-event-beta" bind:element={modalElement}>
  <form class="content" on:submit|self|preventDefault={nextStepOrSubmit}>
    <section class="top" class:scrolled>
      <h1>
        Créer un évènement
        <ButtonGhost
          on:click={() => {
            modalElement.close();
          }}
        >
          <IconClose></IconClose>
        </ButtonGhost>
      </h1>
      <div class="steps">
        <NavigationSteps {steps} bind:currentStep></NavigationSteps>
      </div>
    </section>
    <div class="inputs-and-preview">
      {#if currentStep === 'details'}
        <FormEventBetaStepDetails
          {...event}
          bind:title={event.title}
          bind:description={event.description}
          bind:startsAt={event.startsAt}
          bind:endsAt={event.endsAt}
          bind:location={event.location}
        ></FormEventBetaStepDetails>
      {:else if currentStep === 'situation'}
        <FormEventBetaStepCommunication {...event}></FormEventBetaStepCommunication>
      {:else if currentStep === 'organization'}
        {#await $zeus.query( { lydiaAccounts: { id: true, name: true, group: { pictureFile: true, pictureFileDark: true, name: true } } }, )}
          <LoadingSpinner></LoadingSpinner>
        {:then { lydiaAccounts }}
          <FormEventBetaStepOrganization
            availableLydiaAccounts={lydiaAccounts}
            {...event}
            bind:lydiaAccount={event.beneficiary}
          ></FormEventBetaStepOrganization>
        {/await}
      {:else if currentStep === 'tickets'}
        <FormEventBetaStepTickets
          bind:ticketGroups={event.ticketGroups}
          bind:tickets={event.tickets}
        ></FormEventBetaStepTickets>
      {/if}
    </div>
    <nav class="navigate-steps">
      <p class="status">
        {#if currentStep !== 'details'}
          Modifications enregistrées
        {/if}
      </p>
      <ButtonPrimary smaller submits>
        {#if currentStep === 'visibility'}
          {#if event.visibility === Visibility.Private}Enregistrer{:else}Publier{/if}
        {:else}
          Continuer
        {/if}
      </ButtonPrimary>
    </nav>
  </form>
</Modal>

<style>
  :global(.form-event-beta) {
    width: 100%;
    height: 100%;
    max-width: 1200px;
    flex-direction: column;
  }

  :global(.form-event-beta[open]) {
    display: flex;
  }

  .content {
    position: relative;
    display: grid;
    grid-template-rows: max-content auto max-content;
    flex-grow: 1;
  }

  section.top {
    position: sticky;
    top: 0;
    background: var(--bg);
    z-index: 2;
    transition: box-shadow 0.25s ease;
  }

  section.top.scrolled {
    box-shadow: 0 10px 20px 0 rgb(0 0 0 / 5%);
  }

  h1 {
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--muted-border);
  }

  .steps {
    position: relative;
    left: 0;
    right: 0;
    max-width: 1000px;
    margin: 0 auto;
    padding: 0.5rem 1.5rem;
  }

  .inputs-and-preview {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 4rem;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    min-height: 0;
    padding: 1rem 1.5rem;
    display: grid;
    margin: 0 auto;
  }

  .navigate-steps {
    align-self: end;
    margin-top: auto;
    align-items: center;
    border-top: 1px solid var(--muted-border);
    display: flex;
    justify-content: space-between;
    padding-top: 2rem;
    position: sticky;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg);
    padding: 1rem 1.5rem;
  }
</style>
