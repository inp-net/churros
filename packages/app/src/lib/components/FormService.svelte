<script lang="ts">
  import { LogoSourceType, zeus } from '$lib/zeus';
  import Alert from '$lib/components/Alert.svelte';
  import { goto } from '$app/navigation';
  import InputText from './InputText.svelte';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import InputSelectOne from './InputSelectOne.svelte';
  import InputGroups from './InputGroups.svelte';
  import InputSchools from './InputSchools.svelte';
  import InputStudentAssociations from './InputStudentAssociations.svelte';
  import InputNumber from './InputNumber.svelte';
  import { route } from '$lib/ROUTES';
  import type { LogoSourceType$options } from '$houdini';

  export let service: {
    id?: string;
    localID?: string;
    name: string;
    description: string;
    url: string;
    logo: string;
    logoSourceType: LogoSourceType$options;
    school: null | { uid: string; name: string; id: string };
    studentAssociation: null | { uid?: string; name: string; id: string };
    group: null | {
      id: string;
      uid: string;
      name: string;
      pictureFile: string;
      pictureFileDark: string;
    };
    importance: number;
  } = {
    name: '',
    description: '',
    url: '',
    logo: '',
    logoSourceType: 'Icon',
    importance: 0,
    school: null,
    studentAssociation: null,
    group: null,
  };

  let serverError = '';

  let loading = false;
  const updateService = async () => {
    if (loading) return;
    try {
      loading = true;
      const { upsertService } = await $zeus.mutate({
        upsertService: [
          {
            id: service.id,
            name: service.name,
            url: service.url,
            description: service.description,
            logo: service.logo,
            logoSourceType: service.logoSourceType as LogoSourceType,
            groupUid: service.group?.uid,
            schoolUid: service.school?.uid,
            studentAssociationUid: service.studentAssociation?.uid,
            importance: service.importance,
          },
          {
            '__typename': true,
            '...on Error': { message: true },
            '...on ZodError': { message: true },
            '...on MutationUpsertServiceSuccess': {
              data: {
                id: true,
                localID: true,
                name: true,
                url: true,
                description: true,
                logo: true,
                logoSourceType: true,
                importance: true,
                group: {
                  id: true,
                  uid: true,
                  name: true,
                  pictureFile: true,
                  pictureFileDark: true,
                },
                school: { uid: true, name: true, id: true },
                studentAssociation: { uid: true, name: true, id: true },
              },
            },
          },
        ],
      });

      if (upsertService.__typename !== 'MutationUpsertServiceSuccess') {
        serverError = upsertService.message;
        return;
      }

      serverError = '';
      // @ts-expect-error - undefineds vs nulls blah blah blah i don't care
      service = upsertService.data;
      if (service.localID) await goto(route('/services/[id]/edit', service.localID));
    } finally {
      loading = false;
    }
  };
</script>

{#await $zeus.query( { groups: [{ unlisted: false }, { name: true, uid: true, id: true, pictureFile: true, pictureFileDark: true }] }, )}
  <p class="loading muted">Chargement...</p>
{:then { groups: allGroups }}
  <form on:submit|preventDefault={updateService}>
    <InputText required label="Nom" bind:value={service.name} maxlength={255} />
    <InputText required label="URL" bind:value={service.url} maxlength={255} />
    <InputText label="Description" bind:value={service.description} maxlength={255} />
    <InputNumber
      hint="Les services plus importants sont montrés plus haut dans la liste"
      label="Importance"
      bind:value={service.importance}
    ></InputNumber>
    <InputSelectOne
      label="Type de logo"
      bind:value={service.logoSourceType}
      options={{
        Icon: 'Icon',
        InternalLink: 'Lien interne',
        ExternalLink: 'Lien externe',
        GroupLogo: 'Groupe',
      }}
    />
    <InputText label="Logo" bind:value={service.logo} maxlength={255} />
    <InputSchools label="École" clearable bind:school={service.school} />
    <InputStudentAssociations
      label="Association Etudiante"
      clearable
      bind:association={service.studentAssociation}
    />
    <InputGroups clearable label="Groupe" bind:group={service.group} options={allGroups}
    ></InputGroups>
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
</style>
