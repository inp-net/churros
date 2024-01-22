<script lang="ts">
  import { Selector, zeus } from '$lib/zeus';
  import FormEventBetaPreviewCard from './FormEventBetaPreviewCard.svelte';
  import InputDateRange from './InputDateRange.svelte';
  import InputGroups from './InputGroups.svelte';
  import InputLongText from './InputLongText.svelte';
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
  export let location: string;
  export let startsAt: Date | undefined = undefined;
  export let endsAt: Date | undefined = undefined;

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

<section class="inputs">
  <section class="basic">
    {#await myGroups()}
      <section class="loading">
        <LoadingSpinner></LoadingSpinner>
        Chargement des groupes…
      </section>
    {:then groupOptions}
      <InputGroups required options={groupOptions} label="Organisateur principal" bind:group
      ></InputGroups>
    {/await}
    <InputText required label="Titre" bind:value={title}></InputText>
    <InputLongText rich label="Description" bind:value={description}></InputLongText>
  </section>
  <InputText label="Lieu" bind:value={location}></InputText>
  <InputDateRange time required label="Date" bind:start={startsAt} bind:end={endsAt}
  ></InputDateRange>
</section>

<section class="preview">
  <FormEventBetaPreviewCard {...{ title, description, location, startsAt, endsAt, group }}
  ></FormEventBetaPreviewCard>
</section>

<style>
  .inputs section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 400px;
  }

  .inputs {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>
