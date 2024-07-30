<script lang="ts" context="module">
  export type StudentAssociation = {
    id: string;
    uid?: string;
    name: string;
  };
</script>

<script lang="ts">
  import InputField from './InputField.svelte';
  import IconCheck from '~icons/mdi/check';
  import InputPickObjects from './InputPickObjects.svelte';
  import { zeus } from '$lib/zeus';

  export let clearButtonLabel = 'Effacer';
  export let label: string;
  export let disallowed: StudentAssociation[] = [];
  export let required = false;
  export let association: StudentAssociation | undefined = undefined;
  export let associations: StudentAssociation[] = [];
  export let clearable = !required;
  export let multiple = false;
  export let disallowedExplanation: (g: StudentAssociation) => string = () => 'Impossible';

  export let placeholder = '';
</script>

<InputField {label} {required}>
  {#await $zeus.query({ studentAssociations: [{}, { id: true, name: true, uid: true }] })}
    <p class="loading muted">Chargement...</p>
  {:then { studentAssociations: options }}
    <InputPickObjects
      {clearButtonLabel}
      {clearable}
      {multiple}
      bind:selection={associations}
      bind:value={association}
      disabledOptions={disallowed}
      searchKeys={['name', 'uid']}
      {options}
      pickerTitle={multiple ? 'Choisir des AEs' : 'Choisir une AE'}
    >
      <div class="avatar" slot="thumbnail" let:object>
        {#if object}
          <img src="/student-associations/{object.uid}.png" alt={object.name?.toString()} />
          <span class="group-name">{object?.name}</span>
        {:else}
          <span class="group-name muted">{placeholder || 'Aucune AE sélectionnée'}</span>
        {/if}
      </div>
      <div
        slot="item"
        let:item
        let:selected
        let:disabled
        class="suggestion"
        class:selected
        class:disabled
      >
        <div class="selected-badge" class:selected><IconCheck></IconCheck></div>
        <img src="/student-associations/{item.uid}.png" alt={item.name} />
        {#if disabled}
          <span class="name why">{disallowedExplanation(item)}</span>
        {:else}
          <span class="name">{item.name}</span>
        {/if}
      </div>
    </InputPickObjects>
  {/await}
</InputField>

<style>
  .avatar img {
    --size: 3rem;

    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: var(--size);
    height: var(--size);
    overflow: hidden;
    line-height: var(--size);
    color: var(--muted-text);
    text-align: center;
    object-fit: contain;
    background: var(--muted-bg);
    border-radius: var(--radius-block);
  }

  .avatar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .suggestion {
    position: relative;
    display: flex;
    flex-direction: column;
    row-gap: 0.5rem;
    align-items: center;
    padding: 0.5rem;
  }

  .suggestion img {
    --size: 5rem;

    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--size);
    height: var(--size);
    overflow: hidden;
    color: var(--muted-text);
    text-align: center;
    object-fit: contain;
    background: var(--muted-bg);
    border: 0 solid var(--primary);
    border-radius: var(--radius-block);
    transition: all 0.25s ease;
  }

  .suggestion.disabled {
    opacity: 0.5;
  }

  .suggestion.disabled .why {
    font-style: italic;
  }

  .suggestion.selected img {
    border-width: calc(2 * var(--border-block));
  }

  .suggestion .selected-badge {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    color: var(--primary);
    content: '';
    background: var(--primary-bg);
    border-radius: 50%;
    opacity: 0;
    transition: all 0.125s ease;
    transform: scale(0);
  }

  .suggestion.selected .selected-badge {
    opacity: 1;
    transform: scale(1);
  }
</style>
