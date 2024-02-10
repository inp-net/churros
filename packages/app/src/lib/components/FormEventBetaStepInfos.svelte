<script lang="ts">
  import { DISPLAY_EVENT_FREQUENCY } from '$lib/display';
  import { EventFrequency, Selector, zeus } from '$lib/zeus';
  import InputCheckbox from './InputCheckbox.svelte';
  import InputDate from './InputDate.svelte';
  import InputDateRange from './InputDateRange.svelte';
  import InputGroups, { type Group } from './InputGroups.svelte';
  import InputSelectOne from './InputSelectOne.svelte';
  import InputText from './InputText.svelte';
  import LoadingSpinner from './LoadingSpinner.svelte';

  export let title: string;
  export let group: Group | undefined;
  export let coOrganizers: Array<Group>;
  export let location: string;
  export let startsAt: Date | undefined = undefined;
  export let endsAt: Date | undefined = undefined;
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

  async function myGroups() {
    const {
      me: { groups: memberships },
    } = await $zeus.query({
      me: { groups: { group: { ...eventQuery.group, ...eventQuery.coOrganizers } } },
    });

    return memberships.map((m) => m.group);
  }
</script>

<section class="basic">
  {#await myGroups()}
    <section class="loading">
      <LoadingSpinner></LoadingSpinner>
      Chargement des groupes…
    </section>
  {:then groupOptions}
    <InputGroups required options={groupOptions} label="Organisateur principal" bind:group
    ></InputGroups>
    <InputGroups multiple options={groupOptions} label="Co-organisateurs" bind:groups={coOrganizers}
    ></InputGroups>
  {/await}
  <InputText required label="Titre" bind:value={title}></InputText>
  <InputDateRange time required label="Date" bind:start={startsAt} bind:end={endsAt}
  ></InputDateRange>
  <InputText label="Lieu" bind:value={location}></InputText>
</section>
<section class="recurrence">
  <h2>Récurrence</h2>
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
      options={Object.entries(DISPLAY_EVENT_FREQUENCY).filter(
        ([k]) => k !== EventFrequency.Once.toString(),
      )}
      bind:value={frequency}
    ></InputSelectOne>
    <InputDate
      required={frequency !== EventFrequency.Once}
      bind:value={recurringUntil}
      label="Jusqu'à"
    ></InputDate>
  </div>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .recurrence-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    align-items: start;
  }

  .recurrence-options.disabled {
    opacity: 0.5;
  }

  .basic {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .recurrence {
    margin-top: 2rem;
  }
</style>
