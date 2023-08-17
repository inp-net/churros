<script lang="ts">
  import { zeus } from '$lib/zeus';
  import type { PageData } from '../../routes/groups/[uid]/edit/$types';
  import { _clubQuery as clubQuery } from '../../routes/groups/[uid]/edit/+page';
  import Alert from '$lib/components/Alert.svelte';
  import { goto } from '$app/navigation';
  import InputGroup from './InputGroup.svelte';
  import InputSelectOne from './InputSelectOne.svelte';
  import { DISPLAY_GROUP_TYPES } from '$lib/display';
  import InputText from './InputText.svelte';
  import InputSocialLinks from './InputSocialLinks.svelte';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputCheckbox from './InputCheckbox.svelte';
  import InputListOfGroups from './InputListOfGroups.svelte';
  import InputSchool from './InputSchool.svelte';

  export let data: PageData;

  let serverError = '';

  let {
    address,
    color,
    description,
    email,
    longDescription,
    name,
    selfJoinable,
    type,
    parent,
    related,
    school,
  } = data.group;

  const socialMediaNames = [
    'facebook',
    'instagram',
    'twitter',
    'matrix',
    'linkedin',
    'discord',
    'snapchat',
  ] as const;

  let links = socialMediaNames.map((name) => ({
    name,
    value: data.group.links.find((link) => link.name === name)?.value ?? '',
  }));

  let loading = false;
  const updateClub = async () => {
    if (loading) return;
    try {
      loading = true;
      const { upsertGroup } = await $zeus.mutate({
        upsertGroup: [
          {
            uid: data.group.uid,
            address,
            color,
            description,
            email: email || undefined,
            links,
            longDescription,
            name,
            selfJoinable,
            parentUid: parent?.uid,
            type,
            related: related.map(({ uid }) => uid),
            schoolUid: school?.uid,
          },
          {
            __typename: true,
            '...on Error': { message: true },
            '...on MutationUpsertGroupSuccess': { data: clubQuery },
          },
        ],
      });

      if (upsertGroup.__typename === 'Error') {
        serverError = upsertGroup.message;
        return;
      }

      serverError = '';
      data.group = upsertGroup.data;
      if (data.group.uid) await goto(`/groups/${data.group.uid}/edit`);
    } finally {
      loading = false;
    }
  };
</script>

<form on:submit|preventDefault={updateClub}>
  <InputSelectOne label="Type de groupe" required options={DISPLAY_GROUP_TYPES} bind:value={type} />

  <InputSchool label="École de rattachement" bind:object={school} uid={school?.uid} />

  <InputCheckbox label="Auto-joignable" bind:value={selfJoinable} />

  <InputText required label="Nom" bind:value={name} />
  <InputText label="Description courte" bind:value={description} />
  <InputLongText rich label="Description" bind:value={longDescription} />
  <!-- TODO colors ? -->
  <InputText label="Salle" bind:value={address} />
  <InputText label="Email" type="email" bind:value={email} />
  <InputSocialLinks label="Réseaux sociaux" bind:value={links} />
  <InputGroup clearable label="Groupe parent" bind:group={parent} uid={parent?.uid} />
  <InputListOfGroups
    label="Groupes à voir"
    bind:groups={related}
    uids={related.map((r) => r.uid)}
  />
  {#if serverError}
    <Alert theme="danger"
      >Impossible de sauvegarder les modifications : <br /><strong>{serverError}</strong></Alert
    >
  {/if}
  <section class="submit">
    <ButtonPrimary submits {loading}>Sauvegarder</ButtonPrimary>
  </section>
</form>

<style>
  form {
    display: flex;
    flex-flow: column wrap;
    gap: 2rem;
  }

  section.submit {
    display: flex;
    justify-content: center;
  }
</style>
