<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { loaded, loading, type MaybeLoading } from '$lib/loading';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';

  // eslint-disable-next-line no-undef
  type OptionValue = $$Generic<string | number>;
  const dispatch = createEventDispatcher<{ change: OptionValue[] }>();

  export let value: MaybeLoading<OptionValue[]>;

  /** Array of [value, label] */
  export let options: Array<[OptionValue, string]> = [];
</script>

<div class="checkboxes">
  {#each options as [optionValue, label] (optionValue)}
    <InputCheckbox
      {label}
      value={loading(value, []).includes(optionValue)}
      on:change={({ currentTarget }) => {
        if (!loaded(value)) return;
        if (!(currentTarget instanceof HTMLInputElement)) return;
        value = currentTarget.checked
          ? [...value, optionValue]
          : value.filter((v) => v !== optionValue);
        dispatch('change', value);
      }}
    />
  {/each}
</div>

<style>
  .checkboxes {
    display: flex;
    flex-flow: var(--checkboxes-direction, column) wrap;
    gap: 0.5em 1em;
  }
</style>
