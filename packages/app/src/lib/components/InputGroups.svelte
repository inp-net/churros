<script context="module" lang="ts">
  export type Group = {
    id: string;
    uid: string;
    name: string;
    pictureFile: string;
    pictureFileDark: string;
  };
</script>

<script lang="ts">
  import InputField from './InputField.svelte';
  import IconCheck from '~icons/mdi/check';
  import { groupLogoSrc } from '$lib/logos';
  import { isDark } from '$lib/theme';
  import InputPickObjects from './InputPickObjects.svelte';

  export let clearButtonLabel = 'Effacer';
  export let label: string;
  export let disallowed: Group[] = [];
  export let required = false;
  export let group: Group | undefined = undefined;
  export let groups: Group[] = [];
  export let clearable = !required;
  export let multiple = false;
  export let options: Group[];
  export let disallowedExplanation: (g: Group) => string = () => 'Impossible';
  export let name: string | undefined = undefined;

  export let placeholder = '';
</script>

{#if name && group}
  <input type="hidden" name="{name}/uid" value={group.uid} />
  <input type="hidden" name="{name}/id" value={group.id} />
{/if}

<InputField {label} {required}>
  <InputPickObjects
    {clearButtonLabel}
    {clearable}
    {multiple}
    bind:selection={groups}
    bind:value={group}
    disabledOptions={disallowed}
    searchKeys={['name', 'uid']}
    threshold={0.3}
    {options}
    pickerTitle={multiple ? 'Choisir des groupes' : 'Choisir un groupe'}
  >
    <div class="avatar" slot="thumbnail" let:object>
      {#if object}
        <img src={groupLogoSrc($isDark, object)} alt={object.name?.toString()} />
        <span class="group-name">{object?.name}</span>
      {:else}
        <span class="group-name muted">{placeholder || 'Aucun groupe sélectionné'}</span>
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
      <img src={groupLogoSrc($isDark, item)} alt={item.name} />
      {#if disabled}
        <span class="name why">{disallowedExplanation(item)}</span>
      {:else}
        <span class="name">{item.name}</span>
      {/if}
    </div>
  </InputPickObjects>
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
    border: 0 solid var(--primary-border);
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
    color: var(--primary-text);
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
