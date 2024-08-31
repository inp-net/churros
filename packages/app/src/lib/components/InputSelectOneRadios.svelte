<script lang="ts" context="module">
  export const OPTION_OTHER_VALUE = '';
</script>

<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import InputField from './InputField.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import IconClear from '~icons/mdi/clear-circle-outline';
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
  export let tainted = false;
  export let disabled = false;
  export let unselected = !value;

  $: if (value) unselected = false;

  $: otherOptionIsSelected = Boolean(
    !unselected &&
      (value || tainted) &&
      (value === OPTION_OTHER_VALUE || !optionsWithDisplay.some(([option]) => option === value)),
  );
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
  <div class="wrapper" class:no-label={!label}>
    <fieldset bind:this={fieldsetElement}>
      {#if unselected}
        <input type="hidden" name="{name}/no-answer" />
      {/if}
      {#each optionsWithDisplay as [option, display] (option)}
        <label aria-current={option === value && !otherOptionIsSelected}>
          <input {disabled} type="radio" {required} {name} bind:group={value} value={option} />
          <slot {value} {display} {option}>{display}</slot>
        </label>
      {/each}
      {#if allowOther}
        <label aria-current={otherOptionIsSelected && !unselected}>
          <input
            type="radio"
            {name}
            value={OPTION_OTHER_VALUE}
            bind:group={value}
            on:click={() => {
              tainted = true;
              unselected = false;
            }}
          />
          <slot name="other">Autre</slot>
          <InputText
            on:focus={() => {
              if (!otherOptionIsSelected) value = OPTION_OTHER_VALUE;
            }}
            name="{name}/other"
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
      {#if !required}
        <ButtonGhost
          help="Effacer le choix"
          disabled={unselected}
          on:click={() => {
            value = '';
            unselected = true;
          }}
        >
          <IconClear></IconClear>
        </ButtonGhost>
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

  .wrapper.no-label fieldset {
    padding-top: 0;
  }

  input[type='radio'] {
    width: 0;
    height: 0;
    opacity: 0;
  }

  label::before {
    --size: 1.4em;

    display: inline-block;
    flex-shrink: 0;
    width: var(--size);
    height: var(--size);
    content: '';
    background: var(--bg);
    border: var(--border-block) solid;
    border-radius: 50%;
    transition: all 0.25s ease;
  }

  label[aria-current='true']::before {
    background: var(--primary-bg);
    border-color: var(--primary);
  }

  label:not([aria-current='true']):focus-within::before {
    box-shadow: 0 0 0 0.25em var(--primary);
  }

  label {
    display: flex;

    /* divide gap by two to account for the hidden radio buttons. this'll break if there are other elements */
    column-gap: calc(0.5em / 2);
    align-items: center;
    cursor: pointer;
  }
</style>
