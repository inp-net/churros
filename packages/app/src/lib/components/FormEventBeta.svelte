<script lang="ts" context="module">
  const steps = [
    ['details', 'Infos'],
    ['situation', 'Comm'],
    ['tickets', 'Billets'],
    ['organization', 'Organisation'],
    ['visibility', 'Visibilité'],
  ] as const;

  export type FormEventStep = (typeof steps)[number][0];

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
    ticketGroupId: undefined,
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
    ticketGroupId: string | undefined;
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
  import { EventFrequency, Visibility, zeus, type PaymentMethod } from '$lib/zeus';
  import { addDays } from 'date-fns';
  import { nanoid } from 'nanoid';
  import { createEventDispatcher, onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import FormEventBetaStepInfos from './FormEventBetaStepInfos.svelte';
  import FormEventBetaStepOrganization from './FormEventBetaStepOrganization.svelte';
  import FormEventBetaStepCommunication from './FormEventBetaStepCommunication.svelte';
  import FormEventBetaStepTickets from './FormEventBetaStepTickets.svelte';
  import LoadingSpinner from './LoadingSpinner.svelte';
  import NavigationSteps from './NavigationSteps.svelte';
  import FormEventBetaStepVisibility from './FormEventBetaStepVisibility.svelte';
  import FormEventBetaPreviewCard from './FormEventBetaPreviewCard.svelte';

  let dispatch = createEventDispatcher();
  let scrollableAreaElement: HTMLElement;

  export let group: Event['group'];

  export let event: Event = {
    group,
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

  const stepIndex = (id: string) => steps.findIndex(([href, _]) => href === id);

  let currentStep: FormEventStep = 'tickets';
  const statusMessage = writable('');

  function nextStepOrSubmit({ submitter }: SubmitEvent) {
    const step = (submitter?.dataset['step'] ?? undefined) as FormEventStep | undefined;
    if (currentStep === 'visibility') dispatch('submit');
    else currentStep = step ?? steps[stepIndex(currentStep) + 1][0];
  }

  let scrolled = false;

  onMount(() => {
    scrollableAreaElement.addEventListener('scroll', () => {
      scrolled = scrollableAreaElement.scrollTop > 0;
    });
  });
</script>

<form class="content" on:submit|self|preventDefault={nextStepOrSubmit}>
  <section class="top" class:scrolled>
    <h1>Créer un évènement</h1>
    <div class="steps">
      <NavigationSteps {steps} bind:currentStep></NavigationSteps>
    </div>
  </section>
  <div class="inputs-and-preview" bind:this={scrollableAreaElement}>
    <section class="inputs">
      {#if currentStep === 'details'}
        <FormEventBetaStepInfos
          bind:group={event.group}
          bind:title={event.title}
          bind:location={event.location}
          bind:startsAt={event.startsAt}
          bind:endsAt={event.endsAt}
          bind:frequency={event.frequency}
          bind:recurringUntil={event.recurringUntil}
        ></FormEventBetaStepInfos>
      {:else if currentStep === 'situation'}
        <FormEventBetaStepCommunication
          uid={event.uid}
          bind:description={event.description}
          bind:pictureFile={event.pictureFile}
          bind:links={event.links}
        ></FormEventBetaStepCommunication>
      {:else if currentStep === 'organization'}
        {#await $zeus.query( { lydiaAccounts: { id: true, name: true, group: { pictureFile: true, pictureFileDark: true, name: true } } }, )}
          <LoadingSpinner></LoadingSpinner>
        {:then { lydiaAccounts }}
          <FormEventBetaStepOrganization
            availableLydiaAccounts={lydiaAccounts}
            {...event}
            bind:lydiaAccount={event.beneficiary}
            bind:contactMail={event.contactMail}
          ></FormEventBetaStepOrganization>
        {/await}
      {:else if currentStep === 'tickets'}
        <FormEventBetaStepTickets
          {...event}
          bind:ticketGroups={event.ticketGroups}
          bind:tickets={event.tickets}
        ></FormEventBetaStepTickets>
      {:else if currentStep === 'visibility'}
        <FormEventBetaStepVisibility {...event} bind:visibility={event.visibility}
        ></FormEventBetaStepVisibility>
      {/if}
    </section>
    <section class="preview">
      <FormEventBetaPreviewCard {currentStep} {...event}></FormEventBetaPreviewCard>
    </section>
  </div>
  <nav class="navigate-steps">
    <p class="status">
      {$statusMessage}
    </p>
    <ButtonPrimary smaller submits>
      {#if currentStep === 'visibility'}
        {#if [Visibility.Unlisted, Visibility.Private].includes(event.visibility)}Enregistrer{:else}Publier{/if}
      {:else}
        Continuer
      {/if}
    </ButtonPrimary>
  </nav>
</form>

<style>
  .content {
    height: 100%;
    display: grid;
    flex-grow: 1;
    grid-template-rows: max-content auto max-content;
  }

  section.top {
    position: sticky;
    top: 0;
    z-index: 2;
    background: var(--bg);
    transition: box-shadow 0.25s ease;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    /* justify-content: space-between; */
    justify-content: center;
  }

  section.top.scrolled {
    box-shadow: 0 10px 20px 0 rgb(0 0 0 / 5%);
  }

  .steps {
    padding: 0.5rem 1.5rem;
  }

  .inputs-and-preview {
    position: relative;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 4rem;
    min-height: 0;
    padding: 1rem 1.5rem;
    width: 100%;
  }

  .inputs {
    overflow: hidden auto;
  }

  @media (max-width: 700px) {
    .inputs-and-preview {
      display: flex;
      flex-direction: column;
    }

    .steps {
      display: none;
    }

    .inputs-and-preview :global(.preview) {
      display: none;
    }
  }

  .navigate-steps {
    position: sticky;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    align-self: end;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    margin-top: auto;
    background: var(--bg);
    border-top: 1px solid var(--muted-border);
  }
</style>
