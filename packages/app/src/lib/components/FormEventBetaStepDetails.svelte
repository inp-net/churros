<script lang="ts">
  import { me } from '$lib/session';
  import { Selector, zeus } from '$lib/zeus';
  import FormEventBetaPreviewCard from './FormEventBetaPreviewCard.svelte';
  import FormPicture from './FormPicture.svelte';
  import InputGroups from './InputGroups.svelte';
  import InputLinks from './InputLinks.svelte';
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
  export let pictureFile: string;
  export let uid: string;
  export let links: Array<{ name: string; value: string }>;

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
  <InputLinks label="Liens" bind:value={links}></InputLinks>
  <section class="thumbnail">
    <h2>Miniature</h2>
    <FormPicture
      object={{
        id: 'event',
        uid,
        pictureFile,
      }}
      objectName="Event"
      dark
    ></FormPicture>
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
</style>
