<script lang="ts">
  import type { PageData } from './$types';
  import { zeus } from '$lib/zeus';
  import InputText from '$lib/components/InputText.svelte';
  import InputList from '$lib/components/InputList.svelte';

  export let data: PageData;

  let internalMailDomain = data.school.internalMailDomain;
  let aliasMailDomains: string[] = data.school.aliasMailDomains;
  async function save() {
    await $zeus.mutate({
      updateSchool: [
        {
          uid: data.school.uid,
          name: data.school.name,
          address: data.school.address,
          description: data.school.description,
          internalMailDomain,
          aliasMailDomains,
        },
        {
          __typename: true,
        },
      ],
    });
  }
</script>

<div class="content">
  <form on:submit|preventDefault={save}>
    <div class="side-by-side">
      <InputText
        label="Nom de l'école"
        hint="Le nom de l'école"
        maxlength={255}
        required="true"
        bind:value={data.school.name}
      />
      <InputText
        label="Adresse de l'école"
        hint="L'adresse de l'école"
        maxlength={255}
        required="true"
        bind:value={data.school.address}
      />
    </div>
    <InputText
      label="Description de l'école"
      hint="La description de l'école"
      required="true"
      bind:value={data.school.description}
    />
    <div class="side-by-side">
      <InputText
        label="Email principale"
        hint="L'email principal en .etu de l'école sans le @"
        maxlength={255}
        required="true"
        bind:value={internalMailDomain}
      />
    </div>
    <InputList
      hint="Les autres emails de l'école"
      label="Autres emails"
      bind:value={aliasMailDomains}
    />
  </form>
</div>
