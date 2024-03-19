<script lang="ts" context="module">
  export const OPTION_OTHER_VALUE = '';
</script>

<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import InputField from './InputField.svelte';
  import InputText from '$lib/components/InputText.svelte';
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
  export let allowOther = false;

  $: otherOptionIsSelected =
    value === OPTION_OTHER_VALUE || !optionsWithDisplay.some(([option]) => option === value);
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
      {#each optionsWithDisplay as [option, display] (option)}
        <label aria-current={option === value && !otherOptionIsSelected}>
          <input type="radio" {required} {name} bind:group={value} value={option} />
          <slot {value} {display} {option}>{display}</slot>
        </label>
      {/each}
      {#if allowOther}
        <label aria-current={otherOptionIsSelected}>
          <input type="radio" {name} value={OPTION_OTHER_VALUE} bind:group={value} />
          <slot name="other">Autre</slot>
          <InputText
            on:focus={() => {
              if (!otherOptionIsSelected) value = OPTION_OTHER_VALUE;
            }}
            value=""
            label=""
            required={otherOptionIsSelected}
            on:input={({ detail: { target } }) => {
              if (!(target instanceof HTMLInputElement)) return;
              value = target.value;
            }}
          />
        </label>
      {/if}
    </fieldset>
  </div>
</InputField>

<style>
  fieldset {
    display: flex;
    flex-wrap: wrap;
    gap: var(--border-block);
    gap: 0.5em 1em;
    padding: 0;
    padding-top: 0.5em;
    margin: 0;
    overflow: hidden;
    font-size: 1rem;
    font-weight: normal;
    border: none;
  }

  input[type='radio'] {
    display: none;
  }

  label::before {
    --size: 1.4em;

    display: inline-block;
    width: var(--size);
    height: var(--size);
    content: '';
    background: var(--bg);
    border: var(--border-block) solid var(--border);
    border-radius: 50%;
    transition: all 0.25s ease;
  }

  label[aria-current='true']::before {
    background: var(--primary-bg);
    border-color: var(--primary-border);
  }

  label {
    display: flex;
    column-gap: 0.5em;
    align-items: center;
    cursor: pointer;
  }
</style>
