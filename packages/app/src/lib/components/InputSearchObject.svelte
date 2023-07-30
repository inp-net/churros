<script lang="ts">
  import AutoComplete from 'simple-svelte-autocomplete';
  import IconNone from '~icons/mdi/help';
  import IconClose from '~icons/mdi/close';
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import ButtonGhost from './ButtonGhost.svelte';

  type T = $$Generic<Record<string, unknown>>;
  type V = $$Generic<number | string>;

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  export let object: T | undefined;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  export let value: V | undefined;
  export let search: (query: string) => Promise<T[]>;
  export let labelKey = 'name';
  export let valueKey = 'id';
  export let clearable = false;
</script>

<div class="input-container">
  <div class="thumbnail">
    <slot name="thumbnail" {object}>
      {#if object?.pictureFile}
        <img
          src="{PUBLIC_STORAGE_URL}{object.pictureFile}"
          alt={object?.[labelKey]?.toString() ?? ''}
        />
      {:else}
        <IconNone />
      {/if}
    </slot>
  </div>
  <AutoComplete
    searchFunction={search}
    localFiltering={false}
    bind:selectedItem={object}
    bind:value
    valueFieldName={valueKey}
    labelFieldName={labelKey}
    noResultsText="Aucun résultat"
    loadingText="Chargement…"
  >
    <slot slot="item" name="item" let:item {item} />
  </AutoComplete>
  {#if clearable && object !== undefined && object !== null}
    <ButtonGhost
      on:click={() => {
        object = undefined;
        value = undefined;
      }}><IconClose /></ButtonGhost
    >
  {/if}
</div>

<style>
  .input-container {
    display: grid;
    grid-template-columns: min-content 1fr max-content;
    align-items: center;
    padding: 0.25rem 0.5rem;
    border: var(--border-block) solid var(--border);
    border-radius: var(--radius-block);
  }

  .input-container :global(input) {
    background: none;
    border: none;
  }

  .input-container :global(.autocomplete .autocomplete-list) {
    border: var(--border-block) solid var(--border);
    border-top: none;
    border-radius: var(--radius-block);
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
</style>
