<script lang="ts">
  import { onMount } from 'svelte';
  import IconCheckmark from '~icons/mdi/check';
  import IconClose from '~icons/mdi/close';

  export let tristate = true;
  // eslint-disable-next-line unicorn/no-null
  export let value: boolean | null = null;
  export let name: string | undefined = undefined;
  let previousValue: boolean | null = value;

  // eslint-disable-next-line unicorn/no-null
  const getTriState = (target: HTMLInputElement) => (target.indeterminate ? null : target.checked);

  const setTriState = (target: HTMLInputElement, value: boolean | null) => {
    if (value === null) {
      target.indeterminate = true;
      target.checked = false;
    } else {
      target.indeterminate = false;
      target.checked = value;
    }

    previousValue = value;
  };

  export let labelTrue = 'Oui';
  export let labelFalse = 'Non';
  export let labelNull = 'Inconnu';
  export let label: string;

  let checkboxElement: HTMLInputElement;

  onMount(() => {
    previousValue = value;
    setTriState(checkboxElement, value);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bang = (x: any) => x;
</script>

<label class="input-checkbox" class:tristate>
  <input
    type="checkbox"
    bind:this={checkboxElement}
    on:change={(event) => {
      event.preventDefault();
      if (previousValue === null) setTriState(bang(event).target, true);
      else if (previousValue) setTriState(bang(event).target, false);
      // eslint-disable-next-line unicorn/no-null
      else setTriState(bang(event).target, tristate ? null : true);

      value = getTriState(bang(event).target);
      previousValue = value;
    }}
  />
  <input type="hidden" {name} value={value === null ? 'indeterminate' : value ? 'on' : 'off'} />
  <div class="checkbox" data-state={JSON.stringify(value)}>
    {#if value === true}
      <IconCheckmark />
    {:else if value === false}
      <IconClose />
    {/if}
  </div>
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
</label>

<style>
  .label-value {
    grid-area: value;
    color: var(--sky);
  }

  .label {
    grid-area: label;
  }

  input {
    display: none;
  }

  .checkbox {
    --icon-color: var(--fg);

    position: relative;
    display: inline-block;
    grid-area: box;
    width: 2rem;
    height: 2rem;
    border: var(--border-width) solid var(--fg);
  }

  .checkbox[data-state='null']::after {
    position: absolute;
    left: calc(2rem / 2 - var(--border-width) / 2);
    width: var(--border-width);
    height: 2rem;
    content: '';
    background: var(--fg);
    transform: rotate(45deg);
  }

  .checkbox[data-state='true'],
  .tristate .checkbox[data-state='false'] {
    --icon-color: var(--bg);

    background: var(--fg);
  }

  label {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    min-width: 120px /* XXX: based on width of input when the label is smaller than "Peu importe" */;
    cursor: pointer;
  }

  .labels {
    display: flex;
    flex-direction: column;
  }
</style>
