<script lang="ts">
  import InputField from './InputField.svelte';
  import IconCheck from '~icons/mdi/check';
  import { isDark } from '$lib/theme';
  import InputPickObjects from './InputPickObjects.svelte';
  import { groupLogoSrc } from '$lib/logos';

  type LydiaAccount = {
    id: string;
    name: string;
    group?:
      | undefined
      | null
      | {
          name: string;
          pictureFile: string;
          pictureFileDark: string;
        };
  };
  export let label: string;
  export let disallowed: LydiaAccount[] = [];
  export let required = false;
  export let account: LydiaAccount | undefined |null = undefined;
  export let accounts: LydiaAccount[] = [];
  export let clearable = !required;
  export let options: LydiaAccount[] = [];
  export let multiple = false;
  export let disallowedExplanation: (account: LydiaAccount) => string = () => 'Impossible';

  export let placeholder = '';
</script>

<InputField {label} {required}>
  <InputPickObjects
    {clearable}
    {multiple}
    bind:selection={accounts}
    bind:value={account}
    disabledOptions={disallowed}
    {options}
    pickerTitle={multiple ? 'Choisir des comptes Lydia pro' : 'Choisir un compte Lydia pro'}
  >
    <div class="avatar" slot="thumbnail" let:object>
      {#if object}
        {#if object?.group}
          <img src={groupLogoSrc($isDark, object.group)} alt={object?.group.name.toString()} />
        {/if}
        <span class="name">{object?.name}</span>
      {:else}
        <span class="name muted">{placeholder || 'Aucun compte sélectionné'}</span>
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
      {#if item.group}
        <img src={groupLogoSrc($isDark, item.group)} alt={item.name} />
      {/if}
      {#if disabled}
        <span class="name why">{disallowedExplanation(item)}</span>
      {:else}
        <div class="name">
          <div class="account-name">{item.name}</div>
          {#if item.group}
            <div class="group-name">{item.group.name}</div>
          {/if}
        </div>
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

  .suggestion .name {
    display: flex;
    flex-direction: column;
    gap: 0;
    justify-content: center;
    text-align: center;
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

  .suggestion .group-name {
    font-size: 0.75em;
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
