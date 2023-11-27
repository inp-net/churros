<script lang="ts">
  import { Visibility, EventFrequency, zeus } from '$lib/zeus';
  import { addDays } from 'date-fns';
  import IconNext from '~icons/mdi/chevron-right';
  import IconClose from '~icons/mdi/close';
  import ButtonGhost from './ButtonGhost.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import FormEventBetaStepDetails from './FormEventBetaStepDetails.svelte';
  import Modal from './Modal.svelte';
  import NavigationSteps from './NavigationSteps.svelte';
  import FormEventBetaStepCommunication from './FormEventBetaStepCommunication.svelte';
  import FormEventBetaStepOrganization from './FormEventBetaStepOrganization.svelte';
  import LoadingSpinner from './LoadingSpinner.svelte';
  import ButtonPrimary from './ButtonPrimary.svelte';

  export let modalElement: HTMLDialogElement;

  export let event: {
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
  } = {
    title: 'Quoicoubaka',
    description: '',
    startsAt: new Date(),
    endsAt: addDays(new Date(), 1),
    frequency: EventFrequency.Once,
  };

  let steps: Array<readonly [string, string]> = [
    ['details', 'Détails'],
    ['communication', 'Communication'],
    ['tickets', 'Billets'],
    ['organization', 'Organisation'],
    ['visibility', 'Visibilité'],
  ];

  const stepIndex = (id: string) => steps.findIndex(([href, _]) => href === id);

  let currentStep = 'details';

  function nextStepOrSubmit() {
    if (currentStep === 'visibility') {
      modalElement.close();
    } else {
      currentStep = steps[stepIndex(currentStep) + 1][0];
    }
  }
</script>

<Modal open noPadding class="form-event-beta" bind:element={modalElement}>
  <form class="content" on:submit|preventDefault={nextStepOrSubmit}>
    <section class="top">
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
      {:else if currentStep === 'communication'}
        <FormEventBetaStepCommunication {...event}></FormEventBetaStepCommunication>
      {:else if currentStep === 'organization'}
        {#await $zeus.query( { lydiaAccounts: { id: true, name: true, group: { pictureFile: true, pictureFileDark: true, name: true } } }, )}
          }
          <LoadingSpinner></LoadingSpinner>
        {:then { lydiaAccounts }}
          <FormEventBetaStepOrganization
            availableLydiaAccounts={lydiaAccounts}
            {...event}
            bind:lydiaAccount={event.beneficiary}
          ></FormEventBetaStepOrganization>
        {/await}
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
  }

  h1 {
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .steps {
    position: relative;
    left: 0;
    right: 0;
    border-top: 1px solid var(--muted-border);
    padding: 1rem 0;
  }

  .inputs-and-preview {
    display: grid;
    grid-template-columns: 600px 1fr;
    gap: 4rem;
    overflow: auto;
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
