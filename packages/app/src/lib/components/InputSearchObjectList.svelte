<script lang="ts">
  // @ts-expect-error Untyped lib
  import isDarkColor from 'is-dark-color';
  import AutoComplete from 'simple-svelte-autocomplete';
  import IconClose from '~icons/mdi/close';
  import ButtonGhost from './ButtonGhost.svelte';

  type T = $$Generic;
  type V = $$Generic<number | string>;

  type MaybePromise<T> = Promise<T> | T;

  export let objects: T[];
  export let values: V[];
  export let search: (query: string) => MaybePromise<T[]>;
  export let labelKey = 'name';
  export let valueKey = 'id';
</script>

<div class="input-container">
  <AutoComplete
    multiple
    orderableSelection
    searchFunction={search}
    localFiltering={false}
    bind:selectedItem={objects}
    bind:value={values}
    valueFieldName={valueKey}
    labelFieldName={labelKey}
    noResultsText="Aucun résultat"
    loadingText="Chargement…"
  >
    <slot slot="item" name="item" let:item {item}>
      {item[labelKey]}
    </slot>
    <div
      style:color={item?.color ? (isDarkColor(item.color) ? 'white' : 'black') : undefined}
      style:background-color={item?.color}
      class="tag"
      slot="tag"
      let:item
      let:unselectItem
    >
      <slot name="tag" tag={item}>{item[labelKey]}</slot>

      <ButtonGhost
        --text={item?.color ? (isDarkColor(item.color) ? 'white' : 'black') : undefined}
        darkShadow={item?.color && isDarkColor(item.color)}
        on:click={unselectItem(item)}><IconClose /></ButtonGhost
      >
    </div>
  </AutoComplete>
</div>

<style>
  .input-container {
    display: grid;
    grid-template-columns: 1fr;
    align-items: center;
    padding: 0.25rem 0.5rem;
    border: var(--border-block) solid var(--border);
    border-radius: var(--radius-block);
  }

  .input-container :global(input) {
    background: none;
    border: none;
  }

  .input-container :global(.autocomplete) {
    height: unset !important;
  }

  .input-container :global(.autocomplete .autocomplete-list) {
    position: absolute;
    z-index: 100;
    border: var(--border-block) solid var(--border);
    border-radius: var(--radius-block);
  }

  .tag {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
    background: var(--muted-bg);
    border-radius: var(--radius-block);
  }

  .input-container :global(.autocomplete .input-container) {
    display: flex;
    flex-flow: row wrap;
    gap: 0.5rem;
    height: unset !important;
    border: none !important;
    box-shadow: none !important;
  }
</style>
