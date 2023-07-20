<script lang="ts">
  import Check from '~icons/mdi/check';
  import Close from '~icons/mdi/close';

  export let ternary = false;
  export let value: boolean | null;
  export let label: string;
  export let labelTrue = 'Oui';
  export let labelFalse = 'Non';
  export let labelNull = 'Inconnu';
  let previousValue: boolean | null = value;

  const getTriState = (target: HTMLInputElement) => 
    // eslint-disable-next-line unicorn/no-null
     target.indeterminate ? null : target.checked
  ;

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

  let checkboxElement: HTMLInputElement;
</script>

{#if ternary}
  <label class="input-checkbox" class:ternary>
    <input
      type="checkbox"
      bind:this={checkboxElement}
      on:change={(event) => {
        event.preventDefault();
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
{:else}
  <label class="input-checkbox">
    <input type="checkbox" bind:checked={value} />
    <div class="checkbox" data-state={JSON.stringify(value)}>
      {#if value === true}
        <Check />
      {/if}
    </div>
    <div class="labels">{label}</div>
  </label>
{/if}

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

  .checkbox {
    position: relative;
    display: flex;
    grid-area: box;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: 0.15rem solid var(--text);
    border-color: var(--text);
    border-radius: 25%;
  }

  .checkbox[data-state='null']::after {
    position: absolute;
    top: calc(2rem / 2 - 1.85rem / 2);
    left: calc(2rem / 2 - 0.4rem / 2);
    width: 0.15rem;
    height: 1.6rem;
    content: '';
    background: var(--text);
    transform: rotate(45deg);
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
    min-width: 120px /* XXX: based on width of input when the label is smaller than "Peu importe" */;
    cursor: pointer;
  }

  .labels {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }
</style>
