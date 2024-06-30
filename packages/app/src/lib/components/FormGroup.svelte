<script lang="ts">
  import { GroupType, zeus } from '$lib/zeus';
  import type { PageData } from '../../routes/(app)/groups/[uid]/edit/$types';
  import { _clubQuery as clubQuery } from '../../routes/(app)/groups/[uid]/edit/+page';
  import Alert from '$lib/components/Alert.svelte';
  import { goto } from '$app/navigation';
  import InputSelectOne from './InputSelectOne.svelte';
  import { DISPLAY_GROUP_TYPES } from '$lib/display';
  import InputText from './InputText.svelte';
  import InputSocialLinks from './InputSocialLinks.svelte';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputCheckbox from './InputCheckbox.svelte';
  import { toasts } from '$lib/toasts';
  import InputGroups from './InputGroups.svelte';
  import InputStudentAssociations from './InputStudentAssociations.svelte';
  import { me } from '$lib/session';

  export let data: PageData;
  export let creatingSubgroup = false;

  let serverError = '';

  let {
    address,
    description,
    color,
    email,
    mailingList,
    longDescription,
    website,
    name,
    selfJoinable,
    type,
    parent,
    related,
    studentAssociation,
  } = data.group;

  const socialMediaNames = [
    'facebook',
    'instagram',
    'discord',
    'twitter',
    'linkedin',
    'github',
    'hackernews',
    'anilist',
  ] as const;

  let links = socialMediaNames.map((name) => ({
    name,
    value: data.group.links.find((link) => link.name === name)?.value ?? '',
  }));

  let loading = false;
  const submit = async () => {
    if (loading) return;
    try {
      loading = true;
      const { upsertGroup } = await $zeus.mutate({
        upsertGroup: [
          {
            uid: data.group.uid,
            input: {
              address,
              color,
              description,
              email: email || undefined,
              mailingList: mailingList || undefined,
              links: links.filter((l) => Boolean(l.value)),
              longDescription,
              website,
              name,
              selfJoinable,
              parent: parent?.uid,
              type,
              related: related.map(({ uid }) => uid),
              studentAssociation: studentAssociation?.uid,
            },
          },
          {
            '__typename': true,
            '...on Error': { message: true },
            '...on ZodError': { message: true },
            '...on MutationUpsertGroupSuccess': { data: clubQuery },
          },
        ],
      });

      if ('message' in upsertGroup) {
        serverError = upsertGroup.message;
        return;
      }

      serverError = '';
      data.group = upsertGroup.data;
      toasts.success(`${data.group.name} mis à jour`);
      if (data.group.uid) await goto(`/groups/${data.group.uid}/edit`);
    } finally {
      loading = false;
    }
  };
</script>

{#await $zeus.query({ groups: [{}, clubQuery.parent] })}
  <p class="loading muted">Chargement...</p>
{:then { groups: allGroups }}
  <form on:submit|preventDefault={submit}>
    {#if !creatingSubgroup && ($me?.admin || data.canEditGroup)}
      <InputSelectOne
        label="Type de groupe"
        required
        options={DISPLAY_GROUP_TYPES}
        bind:value={type}
      />

      <div class="side-by-side">
        <InputStudentAssociations
          clearable
          label="AE de rattachement"
          bind:association={studentAssociation}
          required={[GroupType.Club, GroupType.List].includes(type)}
        ></InputStudentAssociations>
      </div>
    {/if}

    <InputCheckbox
      label="Inscription libre"
      help="N'importe qui peut rejoindre le groupe"
      bind:value={selfJoinable}
    />

    <InputText required label="Nom" maxlength={255} bind:value={name} />
    <InputText label="Description courte" maxlength={255} bind:value={description} />
    <InputLongText rich label="Description" bind:value={longDescription} />
    <!-- TODO colors ? -->
    <InputText label="Salle" maxlength={255} bind:value={address} />
    <InputText label="Email" type="email" maxlength={255} bind:value={email} />
    <InputText label="Mailing list" type="email" maxlength={255} bind:value={mailingList} />
    <InputText label="Site web" type="url" maxlength={255} bind:value={website} />
    <InputSocialLinks label="Réseaux sociaux" bind:value={links} />
    {#if !creatingSubgroup}
      <InputGroups clearable label="Groupe parent" bind:group={parent} options={allGroups}
      ></InputGroups>
    {/if}
    <InputGroups multiple label="Groupes à voir" bind:groups={related} options={allGroups} />

    {#if serverError}
      <Alert theme="danger"
        >Impossible de sauvegarder les modifications : <br /><strong>{serverError}</strong></Alert
      >
    {/if}
    <section class="submit">
      <ButtonPrimary submits {loading}>Sauvegarder</ButtonPrimary>
    </section>
  </form>
{/await}

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

  .side-by-side {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    align-items: center;
  }
</style>
