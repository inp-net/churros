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
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { crossfade, fade } from 'svelte/transition';

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

  export let placeholder = '';
</script>

<InputField {label} {required}>
  <InputPickObjects
    on:close
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
    <slot name="input" slot="input" let:openPicker {openPicker}>
      <div class="group-input-current">
        {#if multiple ? groups.length > 0 : group}
          <ButtonSecondary on:click={openPicker}>Changer</ButtonSecondary>
          <div class="groups">
            {#each groups as group (group.uid)}
              <AvatarPerson
                pictureFile={groupLogoSrc($isDark, group)}
                fullName={group.name}
                href="/groups/{group.uid}"
              />
            {/each}
          </div>
        {:else}
          <ButtonSecondary on:click={openPicker}>Choisir</ButtonSecondary>
          Aucun groupe sélectionné
        {/if}
      </div>
    </slot>
    <slot name="thumbnail" slot="thumbnail" let:object>
      <div class="avatar">
        {#if object}
          <img src={groupLogoSrc($isDark, object)} alt={object.name?.toString()} />
          <span class="group-name">{object?.name}</span>
        {:else}
          <span class="group-name muted">{placeholder || 'Aucun groupe sélectionné'}</span>
        {/if}
      </div>
    </slot>
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
  .group-input-current {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    align-items: center;
  }

  .group-input-current .groups {
    display: flex;
    align-items: center;
  }

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
    background: var(--muted-bg);
    border-radius: var(--radius-block);
    object-fit: contain;
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
    background: var(--muted-bg);
    border: 0 solid var(--primary-border);
    border-radius: var(--radius-block);
    transition: all 0.25s ease;
    object-fit: contain;
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
