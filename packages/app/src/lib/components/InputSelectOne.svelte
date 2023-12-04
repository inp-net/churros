<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import InputField from './InputField.svelte';
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
        <label aria-current={option === value}>
          <input type="radio" {required} {name} bind:group={value} value={option} />
          <slot {value} {display} {option}>{display}</slot>
        </label>
      {/each}
    </fieldset>
  </div>
</InputField>

<style>
  fieldset {
    display: flex;
    flex-wrap: wrap;
    gap: var(--border-block);
    padding: 0;
    margin: 0;
    overflow: hidden;
    font-size: 1rem;
    font-weight: normal;
    border: var(--border);
    border-radius: var(--radius-block);

    /* using a border creates a weird gap with the overflow-hidden rectangle of selected item if it hits the corner. for some reason the outline is thicker than the border at the same width, so we multiply by 2/3 to roughly get the same appearance */
    outline: calc(2 / 3 * var(--border-block)) solid var(--border);
    outline-offset: calc(-1 * var(--border-block)) solid var(--border);
  }

  input {
    display: none;
  }

  label {
    display: flex;
    flex-grow: 1;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    color: var(--text);
    cursor: pointer;
    background: var(--bg);
  }

  label[aria-current='true'] {
    font-weight: bold;
    color: #000;
    background: var(--primary-bg);
  }
</style>
