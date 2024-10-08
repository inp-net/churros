<script lang="ts">
  import { tooltip } from '$lib/tooltip';
  import { createEventDispatcher } from 'svelte';
  import Check from '~icons/mdi/check';
  import Close from '~icons/mdi/close';

  export const dispatch = createEventDispatcher<{ willChange: Event; update: boolean | null }>();

  export let ternary = false;
  export let value: boolean | null | undefined;
  export let label: string;
  export let labelTrue = 'Oui';
  export let labelFalse = 'Non';
  export let labelNull = 'Inconnu';
  export let alignRight = false;
  export let help = '';
  export let name: string | undefined = undefined;
  export let disabled = false;
  let previousValue: boolean | null | undefined = value;

  const getTriState = (target: HTMLInputElement) =>
    // eslint-disable-next-line unicorn/no-null
    target.indeterminate ? null : target.checked;
  const setTriState = (target: HTMLInputElement, value: boolean | null | undefined) => {
    if (value === null || value === undefined) {
      target.indeterminate = true;
      target.checked = false;
    } else {
      target.indeterminate = false;
      target.checked = value;
    }

    previousValue = value;
  };

  $: dispatch('update', value);

  let checkboxElement: HTMLInputElement;
</script>

<label
  use:tooltip={help}
  class:nolabel={!label}
  class="input-checkbox"
  class:ternary
  class:align-right={alignRight}
  class:disabled
>
  {#if ternary}
    <input
      type="checkbox"
      {name}
      {disabled}
      bind:this={checkboxElement}
      on:change={(event) => {
        event.preventDefault();
        dispatch('willChange', event);
        if (!(event?.target instanceof HTMLInputElement)) return;
        if (previousValue === null) {
          setTriState(event.target, true);
        } else if (previousValue) {
          setTriState(event.target, false);
        } else {
          // eslint-disable-next-line unicorn/no-null
          setTriState(event.target, ternary ? null : true);
        }

        value = getTriState(event.target);
        previousValue = value;
      }}
    />
    <div class="checkbox" data-state={JSON.stringify(value)}>
      {#if value !== null}
        {#if value === true}
          <Check />
        {:else}
          <Close />
        {/if}
      {/if}
    </div>
    {#if label}
      <div class="labels">
        <span class="label typo-paragraph">{label}</span>
        <span class="label-value typo-details">
          {#if value === null}
            {labelNull}
          {:else if value}
            {labelTrue}
          {:else}
            {labelFalse}
          {/if}
        </span>
      </div>
    {/if}
  {:else}
    <input on:change type="checkbox" bind:checked={value} {disabled} />
    <div class="checkbox" data-state={JSON.stringify(value)}>
      {#if value === true}
        <Check />
      {/if}
    </div>
    {#if label}
      <div class="labels">
        {#if $$slots.default}<slot />{:else}{label}{/if}
      </div>
    {/if}
  {/if}
</label>

<style>
  .label-value {
    grid-area: value;
    color: var(--fg);
  }

  .label {
    grid-area: label;
  }

  input {
    display: none;
  }

  .input-checkbox {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .input-checkbox.align-right {
    flex-direction: row-reverse;
  }

  .checkbox {
    --size: 1.7em;
    --border: var(--border-block);

    position: relative;
    display: flex;
    grid-area: box;
    align-items: center;
    justify-content: center;
    width: var(--size);
    height: var(--size);
    border: var(--border) solid var(--text);
    border-color: var(--text);
    border-radius: 25%;
  }

  .checkbox[data-state='null']::after {
    position: absolute;
    top: calc(50% + var(--border) / 2);
    left: calc(50% - var(--border) / 2);
    width: calc(var(--size) - 2 * var(--border));
    height: var(--border);
    content: '';
    background: var(--text);
    transform: translateY(calc(-50% - var(--border) / 2)) translateX(calc(-50% + var(--border) / 2))
      rotate(45deg);
  }

  .checkbox[data-state='true'] {
    color: var(--bg);
    background: var(--text);
  }

  .ternary .checkbox[data-state='false'] {
    color: var(--text);
    background: var(--bg);
  }

  label {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    cursor: pointer;
  }

  label.disabled {
    opacity: 0.5;
  }

  label:not(.nolabel) {
    min-width: min-content;
  }

  .labels {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }
</style>
