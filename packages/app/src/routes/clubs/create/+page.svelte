<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/buttons/Button.svelte';
  import FormInput from '$lib/components/inputs/FormInput.svelte';
  import { GroupType, zeus, ZeusError } from '$lib/zeus';
  import type { PageData } from './$types';
  import ParentSearch from './ParentSearch.svelte';

  export let data: PageData;

  let name = '';
  let parentUid: string | undefined;

  $: schoolId = data.schools[0].id;

  let loading = false;
  const createGroup = async () => {
    if (loading) return;

    try {
      loading = true;
      const { createGroup: group } = await $zeus.mutate({
        createGroup: [{ type: GroupType.Club, name, schoolId, parentUid }, { uid: true }],
      });
      await goto(`/club/${group.uid}`);
    } catch (error: unknown) {
      if (!(error instanceof ZeusError)) throw error;
    } finally {
      loading = false;
    }
  };
</script>

<form on:submit|preventDefault={createGroup}>
  <FormInput label="Nom du groupe :">
    <input type="text" bind:value={name} required />
  </FormInput>

  <p>
    <ParentSearch bind:parentUid />
  </p>
  <p>
    <label>
      École&nbsp;:
      <select id="school" bind:value={schoolId}>
        {#each data.schools as { id, name }}
          <option value={id}>{name}</option>
        {/each}
      </select>
    </label>
  </p>
  <Button type="submit" theme="primary" {loading}>Créer le group</Button>
</form>

<style lang="scss">
  input,
  select {
    display: block;
    width: 100%;
  }
</style>
