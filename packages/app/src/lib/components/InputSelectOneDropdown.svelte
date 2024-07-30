<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import InputField from './InputField.svelte';
  import ChevronUp from '~icons/mdi/chevron-up';
  import ChevronDown from '~icons/mdi/chevron-down';
  const emit = createEventDispatcher();

  export let value: string | undefined = undefined;
  export let label: string;
  export let options:
    | string[]
    | Record<string, string>
    | Map<string, string>
    | Array<[string, string]>;
  export let name: string | undefined = undefined;
  export let required = false;
  export let hint: string | undefined = undefined;
  export let other: boolean = false;

  let opened = false;
  let errorMessage = '';
  let showEmptyErrors = false;
  $: errorMessage = required && value === undefined && showEmptyErrors ? 'Ce champ est requis' : '';

  onMount(() => {
    if (required) {
      fieldsetElement
        .closest('form')
        ?.querySelector('button[type=submit]')
        ?.addEventListener('click', () => {
          showEmptyErrors = true;
        });
    }
  });

  let optionsWithDisplay: Array<[string, string]> = [];
  $: optionsWithDisplay = Array.isArray(options)
    ? options.map((option) => (Array.isArray(option) ? option : [option, option]))
    : options instanceof Map
      ? [...options.entries()]
      : Object.entries(options);

  let fieldsetElement: HTMLFieldSetElement;

  $: emit('input', value);
</script>

<InputField {label} {required} {hint} errors={errorMessage ? [errorMessage] : []}>
  <div class="wrapper">
    <fieldset bind:this={fieldsetElement}>
      <select
        {required}
        {name}
        bind:value
        on:click={() => {
          opened = !opened;
        }}
      >
        {#each optionsWithDisplay as [option, display] (option)}
          <option value={option}>{display}</option>
        {/each}
        {#if other}
          <option value="Autre">Autre</option>
        {/if}
      </select>
    </fieldset>
    {#if opened}
      <ChevronUp />
    {:else}
      <ChevronDown />
    {/if}
  </div>
</InputField>

<style>
  fieldset {
    display: flex;
    flex-grow: 1;
    flex-wrap: wrap;
    padding: 0;
    margin: 0;
    border: none;
  }

  select {
    display: block;
    width: 100%;
    padding: 0.5rem 1rem;
    color: var(--text);
    appearance: none;
    cursor: pointer;
    background: var(--bg);
    border: none;
    border-radius: var(--radius-block);
  }

  select:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--primary-bg);
  }

  .wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    color: var(--text);
    background: var(--bg);
    border: var(--border-block) solid;
    border-radius: var(--radius-block);
  }
</style>
