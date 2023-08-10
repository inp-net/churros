<script lang="ts">
  import Check from '~icons/mdi/check';
  import Close from '~icons/mdi/close';

  export let ternary = false;
  export let value: boolean | null | undefined;
  export let label: string;
  export let labelTrue = 'Oui';
  export let labelFalse = 'Non';
  export let labelNull = 'Inconnu';
  export let alignRight = false;
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

  let checkboxElement: HTMLInputElement;
</script>

<label class="input-checkbox" class:ternary class:align-right={alignRight}>
  {#if ternary}
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
  {:else}
    <input on:change type="checkbox" bind:checked={value} />
    <div class="checkbox" data-state={JSON.stringify(value)}>
      {#if value === true}
        <Check />
      {/if}
    </div>
    <div class="labels">{label}</div>
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
    --size: 1.7rem;
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
    min-width: 120px /* XXX: based on width of input when the label is smaller than "Peu importe" */;
    cursor: pointer;
  }

  .labels {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }
</style>
