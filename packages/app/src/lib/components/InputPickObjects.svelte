<script lang="ts">
  import Fuse from 'fuse.js';
  import ButtonGhost from './ButtonGhost.svelte';
  import IconSearch from '~icons/mdi/magnify';
  import IconClose from '~icons/mdi/close';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import Modal from './ModalDialog.svelte';
  import InputText from './InputText.svelte';

  type MaybePromise<T> = T | Promise<T>;

  type T = $$Generic<{ id: string }>;
  type K = $$Generic<keyof T>;
  export let clearable = false;
  export let disabledOptions: T[] = [];
  export let multiple = false;
  export let searchKeys: string[] = [];
  export let search: ((query: string) => MaybePromise<Array<{ item: T }>>) | undefined = undefined;
  // why the fuck does eslint think that T | undefined has somehow redundance ? T is $$Generic<{id: string}> and has no overlap with undefined whatsoever???
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  export let value: T | undefined | null = undefined;
  export let threshold: number | undefined = undefined;
  export let selection: T[] = [];
  export let options: T[];
  export let selectionKeys: T[K][] = [];
  export let selectedKey: T[K] | undefined | null = undefined;
  export let key: K = 'id' as K;
  export let pickerTitle = 'Choisir';
  export let clearButtonLabel = 'Effacer';
  const closeOnSelect = !multiple;
  let query = '';

  $: selectionKeys = selection.map((s) => s[key]);
  $: selectedKey = value?.[key];

  // Used to store the selection when the picker is opened. The actual selection is set to this when the picker is closed using the "OK" button (the close "X" button cancels the selection modification)
  $: temporarySelection = structuredClone(selection);

  const asItemType = (x: unknown): T => x as T;

  let dialog: HTMLDialogElement;

  function select(item: T) {
    return () => {
      if (multiple) {
        temporarySelection = selected(item)
          ? temporarySelection.filter((i) => i.id !== item.id)
          : [...temporarySelection, item];
        value = item;
      } else {
        value = item;
        selection = [item];
      }

      if (closeOnSelect) dialog.close();
    };
  }

  function openPicker() {
    dialog.showModal();
  }

  function clear() {
    value = undefined;
    selection = [];
  }

  $: selected = (item: T) => {
    if (multiple) return temporarySelection.some((i) => i.id === item.id);
    return value?.id === item.id;
  };

  $: searcher = search ? { search } : new Fuse(options, { keys: searchKeys, threshold });
  async function shownOptions(query: string) {
    if (query.length <= 1) return options;
    const results = await searcher.search(query);
    return results.map((r) => r.item);
  }

  let groupsListElement: HTMLUListElement;
  let searchFocused = false;
</script>

<Modal
  bind:element={dialog}
  on:close-by-outside-click={() => {
    selection = structuredClone(temporarySelection);
  }}
>
  <div class="content">
    <h1 class="title">
      {pickerTitle}
      <ButtonGhost
        help="Fermer"
        on:click={() => {
          // Cancel the selection
          temporarySelection = structuredClone(selection);
          dialog.close();
        }}><IconClose></IconClose></ButtonGhost
      >
    </h1>
    <ul
      class="groups nobullet"
      class:search-focused={searchFocused}
      class:search-not-empty={query.length > 0}
      bind:this={groupsListElement}
    >
      {#await shownOptions(query)}
        <li class="muted loading">Chargement...</li>
      {:then options}
        {#each options as item (item.id)}
          <li>
            <!-- We use mousedown instead of click so that an element can still be selected while an input is focused. Otherwise, clicking on the element just closes the keyboard (which is pretty cringe) -->
            <ButtonGhost
              disabled={disabledOptions.some((option) => option.id === item.id)}
              on:mousedown={select(item)}
            >
              <slot
                name="item"
                {item}
                selected={selected(item)}
                disabled={disabledOptions.some((option) => option.id === item.id)}
              />
            </ButtonGhost>
          </li>
        {:else}
          <li>
            <slot name="no-results">Aucun résultat</slot>
          </li>
        {/each}
      {/await}
    </ul>
    <div class="search">
      {#if searchKeys.length > 0}
        <InputText
          bind:focused={searchFocused}
          actionIcon={query.length > 0 ? IconClose : undefined}
          on:action={() => {
            query = '';
          }}
          on:focus={() => {
            groupsListElement.style.height = `${groupsListElement.clientHeight}px`;
          }}
          placeholder="Rechercher"
          bind:value={query}
          label=""
        >
          <IconSearch slot="before"></IconSearch>
        </InputText>
      {/if}
      {#if !closeOnSelect}
        <ButtonSecondary
          on:click={() => {
            if (multiple) selection = structuredClone(temporarySelection);
            query = '';
            dialog.close();
          }}>OK</ButtonSecondary
        >
      {/if}
    </div>
  </div>
</Modal>

<slot name="input" {multiple} {selection} {value} {clearable} {openPicker} {clear}>
  <div class="picker-input">
    <div class="current-value">
      {#if multiple}
        <ul class="selection nobullet">
          {#each selection as object (object.id)}
            <li>
              <slot name="thumbnail" object={asItemType(object)} />
            </li>
          {:else}
            <li class="empty">
              <slot name="thumbnail" object={undefined} />
            </li>
          {/each}
        </ul>
      {:else}
        <slot name="thumbnail" object={asItemType(value)} />
      {/if}
    </div>
    <div class="actions">
      {#if clearable}
        <ButtonSecondary disabled={value === undefined && selection.length === 0} on:click={clear}
          >{clearButtonLabel}</ButtonSecondary
        >
      {/if}

      <ButtonSecondary on:click={openPicker}>Choisir</ButtonSecondary>
    </div>
  </div>
</slot>

<style>
  .picker-input {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    justify-content: space-between;
  }

  .picker-input .actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .current-value .selection {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
  }

  .groups {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.5rem;
    place-content: start center;
    width: 100%;
    max-height: 75vh;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .groups li {
    height: min-content;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    max-width: 500px;
  }

  .content h1 {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  /* There's no good way (including with JS) to dectect presence of a virtual keyboard (trust me, I tried); so detecting for the presence of a mouse will do */
  @media not (pointer: fine) {
    .groups.search-focused,
    .groups.search-not-empty {
      flex-direction: row-reverse;
      align-content: end;
    }
  }

  .search {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
</style>
