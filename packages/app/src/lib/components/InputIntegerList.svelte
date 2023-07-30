<script lang="ts">
  import AutoComplete from 'simple-svelte-autocomplete';
  import IconClose from '~icons/mdi/close';
  import ButtonGhost from './ButtonGhost.svelte';

  export let values: number[];
  export let options: number[];
</script>

<div class="input-container">
  <AutoComplete
    multiple
    orderableSelection
    items={options}
    bind:value={values}
    noResultsText="Aucun résultat"
    loadingText="Chargement…"
  >
    <slot slot="item" name="item" let:item {item}>
      {item}
    </slot>
    <div class="tag" slot="tag" let:item let:unselectItem>
      <slot name="tag" tag={item}>{item}</slot>

      <ButtonGhost on:click={unselectItem(item)}><IconClose /></ButtonGhost>
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
