<script lang="ts">
  import { env } from '$env/dynamic/public';
  import { me } from '$lib/session';
  import { Selector, zeus } from '$lib/zeus';
  import FormEventBetaPreviewCard from './FormEventBetaPreviewCard.svelte';
  import FormPicture from './FormPicture.svelte';
  import InputGroups from './InputGroups.svelte';
  import InputLinks from './InputLinks.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputLydiaAccounts from './InputLydiaAccounts.svelte';
  import InputText from './InputText.svelte';
  import LoadingSpinner from './LoadingSpinner.svelte';

  export let contactMail: string;
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
  export let coOrganizers: Array<{
    id: string;
    uid: string;
    name: string;
    pictureFile: string;
    pictureFileDark: string;
  }>;
  export let lydiaAccount:
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

  export let availableLydiaAccounts: Array<{
    name: string;
    id: string;
    group?:
      | undefined
      | {
          pictureFile: string;
          pictureFileDark: string;
          name: string;
        };
  }>;

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
  <section class="contact">
    <h2>Contact</h2>
    <InputText type="email" label="Email de l'orga" bind:value={contactMail} maxlength={255}
    ></InputText>
  </section>

  <section class="banks">
    <h2>Bancaire</h2>
    <InputLydiaAccounts options={availableLydiaAccounts} bind:value={lydiaAccount}
    ></InputLydiaAccounts>
  </section>

  <section class="managers"></section>
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
