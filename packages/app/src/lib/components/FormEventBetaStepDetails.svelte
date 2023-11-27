<script lang="ts">
  import { DISPLAY_EVENT_FREQUENCY } from '$lib/display';
  import { me } from '$lib/session';
  import { EventFrequency, Selector, zeus } from '$lib/zeus';
  import FormEventBetaPreviewCard from './FormEventBetaPreviewCard.svelte';
  import InputCheckbox from './InputCheckbox.svelte';
  import InputDate from './InputDate.svelte';
  import InputGroups from './InputGroups.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputSelectOne from './InputSelectOne.svelte';
  import InputText from './InputText.svelte';
  import LoadingSpinner from './LoadingSpinner.svelte';

  export let title: string;
  export let description: string;
  export let group: {
    id: string;
    uid: string;
    name: string;
    pictureFile: string;
    pictureFileDark: string;
  };
  export let startsAt: Date | undefined = undefined;
  export let endsAt: Date | undefined = undefined;
  export let location: string;
  export let frequency: EventFrequency;
  export let recurringUntil: Date | undefined = undefined;

  export let eventQuery = Selector('Event')({
    coOrganizers: {
      id: true,
      uid: true,
      name: true,
      pictureFile: true,
      pictureFileDark: true,
      studentAssociation: {
        school: {
          name: true,
        },
      },
      children: {
        name: true,
        studentAssociation: {
          school: {
            name: true,
          },
        },
      },
    },
    group: {
      id: true,
      uid: true,
      name: true,
      pictureFile: true,
      pictureFileDark: true,
      studentAssociation: {
        school: {
          name: true,
        },
      },
      children: {
        name: true,
        studentAssociation: {
          school: {
            name: true,
          },
        },
      },
    },
  });

  async function groupInputsOptions() {
    const { groups: allGroups } = await $zeus.query({
      groups: [{}, { ...eventQuery.group, ...eventQuery.coOrganizers }],
    });

    const groupOptions = allGroups.filter((g) => $me?.groups.some((m) => m.group.id === g.id));
    const coOrganizersOptions = [...allGroups];

    return { coOrganizersOptions, groupOptions, allGroups };
  }
</script>

<section class="inputs">
  <section class="basic">
    {#await groupInputsOptions()}
      <section class="loading">
        <LoadingSpinner></LoadingSpinner>
        Chargement des groupes…
      </section>
    {:then { groupOptions, coOrganizersOptions, allGroups }}
      <InputGroups required options={groupOptions} label="Organisateur principal" bind:group
      ></InputGroups>
    {/await}
    <InputText required label="Titre" bind:value={title}></InputText>
    <InputLongText rich label="Description" bind:value={description}></InputLongText>
  </section>
  <section class="when-where">
    <h2>Où ça? Quand ça?</h2>
    <InputText label="Lieu" bind:value={location}></InputText>
    <div class="dates">
      <InputDate time required label="Début" bind:value={startsAt}></InputDate>
      <InputDate time required label="Fin" bind:value={endsAt}></InputDate>
    </div>
      <pre>{JSON.stringify({ startsAt, endsAt }, undefined, 2)}</pre>
    <h3>Récurrence</h3>
    <InputCheckbox
      on:change={() => {
        frequency = frequency === EventFrequency.Once ? EventFrequency.Weekly : EventFrequency.Once;
      }}
      label="L'évènement se répète"
      value={frequency !== EventFrequency.Once}
    ></InputCheckbox>
    <div class="recurrence-options" class:disabled={frequency === EventFrequency.Once}>
      <InputSelectOne
        required={frequency !== EventFrequency.Once}
        label="Répétition"
        options={Object.entries(DISPLAY_EVENT_FREQUENCY).filter(([k]) => k !== EventFrequency.Once)}
        bind:value={frequency}
      ></InputSelectOne>
      <InputDate
        required={frequency !== EventFrequency.Once}
        bind:value={recurringUntil}
        label="Jusqu'à"
      ></InputDate>
    </div>
  </section>
</section>

<section class="preview">
  <FormEventBetaPreviewCard {...$$props}></FormEventBetaPreviewCard>
</section>

<style>
  .inputs section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .inputs {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .inputs .dates {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    align-items: start;
  }

  .inputs .recurrence-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    align-items: start;
  }

  .inputs .recurrence-options.disabled {
    opacity: 0.5;
  }
</style>
