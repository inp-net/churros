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
    uid: string,
    id: string,
    order: number,
  ) => Ticket = (event, uid, id, order) => ({
    order,
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
    uid,
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
  export function shadowValue() {
    return '::' + nanoid(10);
  }

  export function isShadowValue(id: string) {
    return id.startsWith('::');
  }

  export function eraseShadowValues(...things: Array<{ id: string; uid?: string }>) {
    return things.map((t) => ({
      ...t,
      id: isShadowValue(t.id) ? '' : t.id,
      ...(t.uid ? { uid: isShadowValue(t.uid) ? '' : t.uid } : {}),
    }));
  }
  export type Ticket = {
    id: string;
    uid: string;
    order: number;
    group?: { uid: string } | undefined;
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
    openToMajors: Array<{ name: string; shortName: string; id: string; uid: string }>;
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
    group?: {
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
      uid: string;
      name: string;
      capacity: number;
    }>;
  };
</script>

<script lang="ts">
  import { goto, pushState } from '$app/navigation';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import { toasts } from '$lib/toasts';
  import {
    EventFrequency,
    Visibility,
    zeus,
    type PaymentMethod,
    type ValueTypes,
    EventDraftStep,
  } from '$lib/zeus';
  import { addDays } from 'date-fns';
  import { nanoid } from 'nanoid';
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import FormEventBetaPreviewCard from './FormEventBetaPreviewCard.svelte';
  import FormEventBetaStepCommunication from './FormEventBetaStepCommunication.svelte';
  import FormEventBetaStepInfos from './FormEventBetaStepInfos.svelte';
  import FormEventBetaStepOrganization from './FormEventBetaStepOrganization.svelte';
  import FormEventBetaStepTickets from './FormEventBetaStepTickets.svelte';
  import FormEventBetaStepVisibility from './FormEventBetaStepVisibility.svelte';
  import LoadingSpinner from './LoadingSpinner.svelte';
  import NavigationSteps from './NavigationSteps.svelte';

  let dispatch = createEventDispatcher();
  let scrollableAreaElement: HTMLElement;
  let bottomBarMessage = '';

  function signalSavedChanges(message: string) {
    bottomBarMessage = message;
    setTimeout(() => {
      bottomBarMessage = '';
    }, 3000);
  }

  // @ts-ignore
  export let event: Event = {
    group: undefined,
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
          shadowValue(),
          shadowValue(),
          0,
        ),
        name: 'ogziogrjoirz',
      },
      {
        ...defaultTicket(
          { tickets: [], startsAt: new Date(), endsAt: addDays(new Date(), 1) },
          shadowValue(),
          shadowValue(),
          0,
        ),
        name: 'greoigjroiger',
      },
    ],
  };

  export let creating = !event?.id;
  export let goBackTo = '';

  const stepIndex = (id: string) => steps.findIndex(([href, _]) => href === id);

  export let currentStep: FormEventStep = 'details';

  /**
   * Returns true if the changes were successfully applied
   */
  async function saveChanges(): Promise<boolean> {
    switch (currentStep) {
      case 'details': {
        if (!event.endsAt || !event.startsAt) {
          toasts.error('Renseignes une date de début et de fin');
          return false;
        }

        if (!event.group) {
          toasts.error('Il manque le groupe organisateur');
          return false;
        }

        // Save first draft
        const { upsertEvent } = await $zeus.mutate({
          upsertEvent: [
            {
              id: event.id,
              input: {
                endsAt: event.endsAt!,
                startsAt: event.startsAt!,
                coOrganizers: event.coOrganizers.map((c) => c.uid),
                group: event.group.uid,
                location: event.location,
                frequency: event.frequency,
                title: event.title,
                recurringUntil: event.recurringUntil,
              } as NonNullable<ValueTypes['Mutation']['upsertEvent']>[0]['input'],
            },
            {
              '__typename': true,
              '...on Error': { message: true },
              '...on MutationUpsertEventSuccess': { data: { id: true, uid: true } },
            },
          ],
        });
        if (upsertEvent.__typename === 'Error') {
          toasts.error(upsertEvent.message);
          return false;
        }
        event.id = upsertEvent.data.id;
        event.uid = upsertEvent.data.uid;
        return true;
      }

      case 'situation': {
        if (!event.group) {
          toasts.error('Il manque le groupe organisateur');
          return false;
        }

        const { upsertEvent } = await $zeus.mutate({
          upsertEvent: [
            {
              id: event.id,
              input: {
                title: event.title,
                startsAt: event.startsAt,
                endsAt: event.endsAt,
                group: event.group.uid,
                description: event.description,
                links: event.links,
              } as NonNullable<ValueTypes['Mutation']['upsertEvent']>[0]['input'],
            },
            {
              '__typename': true,
              '...on Error': { message: true },
              '...on MutationUpsertEventSuccess': {
                data: {
                  id: true,
                },
              },
            },
          ],
        });

        if (upsertEvent.__typename === 'Error') {
          toasts.error("Impossible de sauvegarder l'évènement", upsertEvent.message);
          return false;
        }
        return true;
      }

      case 'tickets': {
        // Nothing to do, tickets were saved on the fly
        return true;
      }

      case 'organization': {
        if (!event.group) {
          toasts.error('Il manque le groupe organisateur');
          return false;
        }

        const { upsertEvent } = await $zeus.mutate({
          upsertEvent: [
            {
              id: event.id,
              input: {
                contactMail: event.contactMail,
                lydiaAccountId: event.beneficiary?.id,
                bannedUsers: [], // TODO
                group: event.group.uid,
                description: event.description,
                title: event.title,
                coOrganizers: event.coOrganizers.map((c) => c.uid),
                frequency: event.frequency,
                startsAt: event.startsAt,
                endsAt: event.endsAt,
                draftStep: EventDraftStep.Organisation,
                links: event.links,
                showPlacesLeft: true, // TODO
                visibility: event.visibility,
                location: event.location,
              },
            },
            {
              '__typename': true,
              '...on Error': { message: true },
              '...on MutationUpsertEventSuccess': {
                data: {
                  contactMail: true,
                  beneficiary: {
                    name: true,
                    id: true,
                    group: { uid: true, name: true, pictureFile: true, pictureFileDark: true },
                  },
                },
              },
            },
          ],
        });

        // TODO update managers too

        switch (upsertEvent.__typename) {
          case 'Error': {
            toasts.error("Impossible de sauvegarder l'évènement", upsertEvent.message);
            return false;
          }

          case 'MutationUpsertEventSuccess': {
            event.contactMail = upsertEvent.data.contactMail;
            event.beneficiary = upsertEvent.data.beneficiary;
            return true;
          }
        }
      }
    }

    return false;
  }

  async function nextStepOrSubmit({ submitter }: SubmitEvent) {
    let targetStep = (submitter?.dataset['step'] ??
      steps[stepIndex(currentStep) + 1][0]) as FormEventStep;

    const oldEvent = structuredClone(event);
    if (!event.group) {
      toasts.error('Il manque le groupe organisateur');
      return;
    }
    const ok = await saveChanges();
    if (ok) {
      signalSavedChanges(
        oldEvent.id !== event.id ? "Brouillon d'évènement créé." : 'Changements sauvegardés.',
      );

      switch (currentStep) {
        case 'details': {
          currentStep = targetStep;
          // Navigate to edit page so that reloading does not loose progress (in the UI)
          if (creating)
            pushState(`/events/${event.group.uid}/${event.uid}/edit?step=${targetStep}`, {});

          break;
        }

        case 'situation': {
          currentStep = targetStep;
        }

        case 'tickets': {
          currentStep = targetStep;
        }

        case 'organization': {
          currentStep = targetStep;
        }

        case 'visibility': {
          // Event created!
          if (creating) pushState(`/events/${event.group.uid}/${event.uid}`, {});
        }
      }
    }
  }

  let scrolled = false;

  onMount(() => {
    scrollableAreaElement.addEventListener('scroll', () => {
      scrolled = scrollableAreaElement.scrollTop > 0;
    });
  });
</script>

<form
  class="content"
  on:submit|self|preventDefault={async (e) => {
    const willGoToNextStep = !creating || Boolean(e.submitter?.dataset['step']);

    if (willGoToNextStep) nextStepOrSubmit(e);
    else saveChanges();
  }}
>
  <section class="top" class:scrolled>
    <h1>
      {#if goBackTo}
        <ButtonBack go={goBackTo}></ButtonBack>
      {/if}
      {#if creating}
        Création d'un évènement
      {:else}
        Modification de {event.title}
      {/if}
    </h1>
    <div class="steps">
      <NavigationSteps {steps} bind:currentStep></NavigationSteps>
    </div>
  </section>
  <div class="inputs-and-preview" bind:this={scrollableAreaElement}>
    <section class="inputs">
      {#if currentStep === 'details'}
        <FormEventBetaStepInfos
          bind:coOrganizers={event.coOrganizers}
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
          eventUid={event.uid}
          eventId={event.id}
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
          eventId={event.id}
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
    {#key bottomBarMessage}
      <p class="status" transition:fade>
        {bottomBarMessage}
      </p>
    {/key}
    <ButtonPrimary smaller submits>
      {#if !creating}
        Sauvegarder
      {:else if currentStep === 'visibility'}
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
    width: 100%;
    max-width: 1200px;
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
    justify-content: space-between;
    justify-items: center;
    /* justify-content: center; */
  }

  section.top h1 {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    column-gap: 0.5em;
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
    container: inputs-and-preview / inline-size;
  }

  @container (max-width: 700px) {
    .preview {
      display: none;
    }
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
