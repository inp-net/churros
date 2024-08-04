<script lang="ts">
  import type { PageData } from './$types';
  import { zeus } from '$lib/zeus';
  import InputText from '$lib/components/InputText.svelte';
  import InputList from '$lib/components/InputList.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import { goto } from '$app/navigation';
  import GroupInput from '$lib/components/GroupInput.svelte';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import FormPicture from '$lib/components/FormPicture.old.svelte';

  export let data: PageData;
  const initialData = structuredClone(data);

  let studentMailDomain = data.school.studentMailDomain;
  let aliasMailDomains: string[] = data.school.aliasMailDomains;
  async function save() {
    const { updateSchool } = await $zeus.mutate({
      updateSchool: [
        {
          uid: data.school.uid,
          name: data.school.name,
          address: data.school.address,
          description: data.school.description,
          studentMailDomain,
          aliasMailDomains,
        },
        {
          __typename: true,
        },
      ],
    });
    if (updateSchool.__typename === 'School') goto('../');
  }

  $: schoolPicObj = {
    pictureFile: data.school.pictureFile,
    uid: data.school.uid,
    id: data.school.id,
  };
</script>

<div class="content">
  <h1>
    <ButtonBack go=".."></ButtonBack>
    Modification de {initialData.school.name}
  </h1>
  <FormPicture objectName="School" bind:object={schoolPicObj} />
  <form on:submit|preventDefault={save}>
    <InputText required label="Nom" maxlength={255} bind:value={data.school.name} />

    <InputText label="Adresse postale" maxlength={255} bind:value={data.school.address} />

    <InputLongText label="Description" rich bind:value={data.school.description} />

    <GroupInput>
      <h2 slot="legend">Validation des étudiant·e·s</h2>
      <p>
        Toutes les comptes créés avec pour adresse e-mail une adresse dont le domaine (la partie
        après le '@') est l'un des domaines suivants seront attribués à cette école.
      </p>
      <InputText
        label="Domaine mail étudiant"
        maxlength={255}
        required="true"
        bind:value={studentMailDomain}
      />
      <InputList label="Autres domaines mails" bind:value={aliasMailDomains} />
    </GroupInput>

    <div class="submit">
      <ButtonPrimary submits>Enregistrer</ButtonPrimary>
    </div>
  </form>
</div>

<style>
  .content {
    max-width: 800px;
    margin: 0 auto;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .submit {
    text-align: center;
  }
</style>
