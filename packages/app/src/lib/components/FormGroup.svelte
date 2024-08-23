<script lang="ts">
  import { goto } from '$app/navigation';
  import { fragment, graphql, type FormGroup } from '$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import { DISPLAY_GROUP_TYPES } from '$lib/display';
  import { mutationErrorMessages, mutationSucceeded } from '$lib/errors';
  import { toasts } from '$lib/toasts';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import InputCheckbox from './InputCheckbox.svelte';
  import InputGroups from './InputGroups.svelte';
  import InputLongText from './InputLongText.svelte';
  import InputSelectOne from './InputSelectOne.svelte';
  import InputSocialLinks from './InputSocialLinks.svelte';
  import InputStudentAssociations from './InputStudentAssociations.svelte';
  import InputText from './InputText.svelte';

  // export let data: PageData;
  export let creatingSubgroup = false;

  export let group: FormGroup;
  $: data = fragment(
    group,
    graphql(`
      fragment FormGroup on Group {
        uid
        address
        color
        description
        email
        mailingList
        longDescription
        website
        canEditDetails
        name
        selfJoinable
        type
        parent {
          uid
          name
          id
          pictureFile
          pictureFileDark
        }
        related {
          uid
          name
          id
          pictureFile
          pictureFileDark
        }
        studentAssociation {
          uid
          id
          name
        }
        links {
          name
          value
        }
      }
    `),
  );

  let serverError = '';

  $: ({
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
  } = $data);

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
    value: $data?.links.find((link) => link.name === name)?.value ?? '',
  }));

  let loading = false;
  const submit = async () => {
    if (loading) return;
    try {
      loading = true;
      // const { upsertGroup } = await $zeus.mutate({
      //   upsertGroup: [
      //     {
      //       uid: data.group.uid,
      //       input: {
      //         address,
      //         color,
      //         description,
      //         email: email || undefined,
      //         mailingList: mailingList || undefined,
      //         longDescription,
      //         website,
      //         name,
      //         selfJoinable,
      //         parent: parent?.uid,
      //         type,
      //         related: related.map(({ uid }) => uid),
      //         studentAssociation: studentAssociation?.uid,
      //       },
      //     },
      //     {
      //       '__typename': true,
      //       '...on Error': { message: true },
      //       '...on ZodError': { message: true },
      //       '...on MutationUpsertGroupSuccess': { data: clubQuery },
      //     },
      //   ],
      // });

      const result = await graphql(`
        mutation UpsertGroup($uid: UID!, $input: UpsertGroupInput!) {
          upsertGroup(uid: $uid, input: $input) {
            __typename
            ... on MutationUpsertGroupSuccess {
              data {
                ...FormGroup
              }
            }
            ...MutationErrors
          }
        }
      `).mutate({
        uid: $data.uid,
        input: {
          address,
          color,
          description,
          email: email || undefined,
          mailingList: mailingList || undefined,
          longDescription,
          website,
          name,
          selfJoinable,
          parent: parent?.uid,
          type,
          related: related.map(({ uid }) => uid),
          studentAssociation: studentAssociation?.uid,
        },
      });

      if (mutationSucceeded('upsertGroup', result)) {
        serverError = '';
        toasts.success(`${$data.name} mis à jour`);
        if ($data.uid) await goto(`/groups/${$data.uid}/edit`);
      } else {
        serverError = mutationErrorMessages('upsertGroup', result).join(', ');
        return;
      }
    } finally {
      loading = false;
    }
  };

  const AllGroups = graphql(`
    query AllGroups {
      groups {
        uid
        name
        id
        pictureFile
        pictureFileDark
      }
    }
  `);
</script>

{#await AllGroups.fetch().then((d) => d.data ?? { groups: [] })}
  <p class="loading muted">Chargement...</p>
{:then { groups: allGroups }}
  <form on:submit|preventDefault={submit}>
    {#if $data.canEditDetails}
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
          required={['Club', 'List'].includes(type)}
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
    <InputText
      label="Email"
      type="email"
      maxlength={255}
      value={email ?? ''}
      on:input={({ detail }) => {
        email = detail.currentTarget.value || null;
      }}
    />
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
