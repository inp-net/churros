<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import AutoComplete from 'simple-svelte-autocomplete';
  import IconNone from '~icons/mdi/help';
  import IconClose from '~icons/mdi/close';
  import { env } from '$env/dynamic/public';
  import ButtonGhost from './ButtonGhost.svelte';
  const emit = createEventDispatcher();

  type T = $$Generic<Record<string, unknown>>;
  type V = $$Generic<number | string>;
  type MaybePromise<T> = T | Promise<T>;

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  export let object: T | undefined;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  export let value: V | undefined | null;
  export let search: (query: string) => MaybePromise<T[]>;
  export let labelKey = 'name';
  export let valueKey = 'id';
  export let clearable = false;
  export let name: string | undefined = undefined;

  export let placeholder = '';

  let query: string;

  const asItemType = (x: unknown): T => x as T;
</script>

<div class="input-container">
  {#if name && value}
    <input type="hidden" {name} {value} />
  {/if}
  <div class="thumbnail">
    <slot name="thumbnail" {object}>
      {#if object?.pictureFile}
        <img
          src="{env.PUBLIC_STORAGE_URL}{object.pictureFile}"
          alt={object?.[labelKey]?.toString() ?? ''}
        />
      {:else}
        <IconNone />
      {/if}
    </slot>
  </div>
  <AutoComplete
    {placeholder}
    searchFunction={search}
    localFiltering={false}
    bind:selectedItem={object}
    bind:value
    bind:text={query}
    valueFieldName={valueKey}
    labelFieldName={labelKey}
    noResultsText="Aucun résultat"
    loadingText="Chargement…"
    {...$$restProps}
  >
    <slot slot="item" name="item" let:item item={asItemType(item)}>{item[labelKey]}</slot>
  </AutoComplete>
  {#if clearable && object !== undefined && object !== null}
    <ButtonGhost
      on:click={() => {
        object = undefined;
        value = undefined;
        query = '';
        emit('clear');
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
    color: var(--text);
    background: none;
    border: none;
  }

  .input-container :global(.autocomplete .autocomplete-list) {
    color: var(--text);
    background-color: var(--bg);
    border: var(--border-block) solid var(--border);
    border-top: none;
    border-radius: var(--radius-block);
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  .input-container :global(.autocomplete .autocomplete-list-item) {
    color: var(--text);
  }
</style>
