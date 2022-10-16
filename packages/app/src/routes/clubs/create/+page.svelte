<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/buttons/Button.svelte';
  import { GroupType, zeus, ZeusError } from '$lib/zeus';
  import type { PageData } from './$types';

  export let data: PageData;

  let name = '';
  let parent: { uid: string; name: string } | undefined;
  let parents: Array<{ uid: string; name: string }> = [];
  let parentSearch = '';
  $: schoolId = data.schools[0].id;

  let loading = false;
  const createGroup = async () => {
    if (loading) return;

    try {
      loading = true;
      const { createGroup: group } = await $zeus.mutate({
        createGroup: [
          { type: GroupType.Club, name, schoolId, parentUid: parent?.uid },
          { uid: true },
        ],
      });
      await goto(`/club/${group.uid}`);
    } catch (error: unknown) {
      if (!(error instanceof ZeusError)) throw error;
    } finally {
      loading = false;
    }
  };

  const asInput = (input: EventTarget | null) => input as HTMLInputElement;
</script>

<form on:submit|preventDefault={createGroup}>
  <p>
    <label>Nom du group&nbsp;: <input type="text" bind:value={name} required /></label>
  </p>

  <p>
    <label>
      Groupe parent&nbsp;: <input
        type="search"
        list="parents"
        bind:value={parentSearch}
        on:input={async ({ target }) => {
          parent = undefined;
          if (!parentSearch) return;
          try {
            const { group } = await $zeus.query({
              group: [{ uid: parentSearch }, { uid: true, name: true }],
            });
            asInput(target).setCustomValidity('');
            parent = group;
          } catch {
            asInput(target).setCustomValidity('Veuillez entrer un groupe parent valide');
            const { searchGroup } = await $zeus.query({
              searchGroup: [
                { q: parentSearch, first: 10 },
                { edges: { node: { uid: true, name: true } } },
              ],
            });
            parents = searchGroup.edges.map(({ node }) => node);
          }
        }}
      />
    </label>
    {#if parent}✅{/if}
    <datalist id="parents">
      {#each parents as parent}
        <option value={parent.uid}>{parent.name}</option>
      {/each}
    </datalist>
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
