<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { type MaybeLoading, LoadingText } from '$lib/loading';

  const dispatch = createEventDispatcher<{ change: Value }>();

  type Value = $$Generic<string | number>;
  export let value: MaybeLoading<Value> | undefined = undefined;
  export let options:
    | Value[]
    | Record<Value, MaybeLoading<string>>
    | Array<[Value, MaybeLoading<string>]> = [];

  export let isDisabled: (option: Value) => boolean = () => false;

  let optionsWithDisplay: Array<[Value, MaybeLoading<string>]> = [];
  $: optionsWithDisplay = Array.isArray(options)
    ? options.map((option) => (Array.isArray(option) ? option : [option, option.toString()]))
    : Object.entries(options).map(([value, label]) => [value as Value, label as string]);
</script>

{#each optionsWithDisplay as [optionValue, label] (optionValue)}
  {@const disabled = isDisabled(optionValue)}
  <label class="input-radio" aria-current={optionValue === value} aria-disabled={disabled}>
    <input
      on:change={() => {
        dispatch('change', optionValue);
      }}
      type="radio"
      value={optionValue}
      {disabled}
      bind:group={value}
    />
    <slot name="label" {label} option={optionValue} {disabled}>
      <LoadingText value={label} />
    </slot>
  </label>
{/each}

<style>
  input[type='radio'] {
    display: none;
  }

  label {
    --default-radio-size: 1rem;

    position: relative;
    display: flex;
    align-items: center;
    padding: 0.25rem;
    padding-left: calc(var(--radio-size, var(--default-radio-size)) * 1.5);
    cursor: pointer;
  }

  label::before,
  label::after {
    position: absolute;
    left: 0;
    box-sizing: border-box;
    display: block;
    width: var(--radio-size, var(--default-radio-size));
    height: var(--radio-size, var(--default-radio-size));
    content: '';
    border-radius: 1rem;
    transition: all 100ms ease;
  }

  label::before {
    background: var(--bg);
    border: var(--border-block) solid var(--text);
  }

  label[aria-current='true']::after {
    border: calc(var(--radio-size, var(--default-radio-size)) / 2) solid var(--text);
  }

  label[aria-disabled='true'] {
    cursor: not-allowed;
  }

  label[aria-disabled='true']::before {
    border-color: var(--shy);
    border-style: dashed;
  }
</style>
