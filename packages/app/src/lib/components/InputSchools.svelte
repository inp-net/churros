<script lang="ts">
  import { graphql } from '$houdini';
  import AvatarSchool from '$lib/components/AvatarSchool.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import PickSchool from '$lib/components/PickSchool.svelte';
  import InputField from './InputField.svelte';

  export let label: string;
  export let disallowed: string[] = [];
  export let required = false;
  export let school: string | null = null;
  export let schools: string[] = [];
  export let multiple = false;

  export let placeholder = '';

  const Options = graphql(`
    query InputSchools_Options {
      schools {
        uid
        ...AvatarSchool
        ...PickSchool @mask_disable
      }
    }
  `);
</script>

<InputField {label} {required}>
  {#await Options.fetch().then((r) => r.data?.schools ?? [])}
    <p class="loading muted">Chargement...</p>
  {:then options}
    <PickSchool
      {multiple}
      bind:selection={schools}
      bind:value={school}
      disabledOptions={disallowed}
      searchKeys={['name', 'uid']}
      {options}
      title={multiple ? 'Choisir des écoles' : 'Choisir une école'}
      let:open
    >
      <div class="selected">
        <div class="avatar">
          {#if school}
            <AvatarSchool name school={options.find((s) => s.uid === school) ?? null} />
          {:else}
            <span class="muted">{placeholder}</span>
          {/if}
        </div>
        <ButtonSecondary on:click={open}>Changer</ButtonSecondary>
      </div>
    </PickSchool>
  {/await}
</InputField>

<style>
  .selected {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
