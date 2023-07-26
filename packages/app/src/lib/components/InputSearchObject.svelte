<script lang="ts">
  import AutoComplete from 'simple-svelte-autocomplete';
  import IconNone from '~icons/mdi/help';
  import { PUBLIC_STORAGE_URL } from '$env/static/public';

  type T = Record<string, unknown>;
  export let object: T | undefined;
  export let value: string | undefined;
  export let search: (query: string) => Promise<T[]>;
  export let labelKey = 'name';
  export let valueKey = 'id';
</script>

<div class="input-container">
  <div class="thumbnail">
    <slot name="thumbnail" {object}>
      {#if object}
        <img
          src="{PUBLIC_STORAGE_URL}{object.pictureFile}"
          alt={object[labelKey]?.toString() ?? ''}
        />
      {:else}
        <IconNone />
      {/if}
    </slot>
  </div>
  <AutoComplete
    lock
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
</div>

<style>
  .input-container {
    display: grid;
    grid-template-columns: min-content 1fr;
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
