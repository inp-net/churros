<script lang="ts">
  import { loaded, type MaybeLoading } from '$lib/loading';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ update: boolean; change: undefined }>();

  type Value = $$Generic<MaybeLoading<boolean> | boolean>;

  export let value: Value;

  /** Assert that you'll use two-way binding on value (i.e. do bind:value instead of value) */
  export let twoway = false;

  let _value: boolean;
  $: if ((!twoway || _value === undefined) && loaded(value)) _value = value as boolean;
</script>

<div class="switch">
  <input
    type="checkbox"
    on:change={({ currentTarget }) => {
      if (!(currentTarget instanceof HTMLInputElement)) return;
      dispatch('update', currentTarget.checked);
      dispatch('change');
    }}
    bind:checked={_value}
  />
  <span class="slider" />
</div>

<style>
  /* The switch - the box around the slider */
  .switch {
    position: relative;
    display: inline-block;
    width: 2.3em;
    height: 0.75em;
  }

  /* Hide default HTML checkbox */
  .switch input {
    width: 0;
    height: 0;
    opacity: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    inset: 0;
    cursor: pointer;
    background-color: #ccc;
    border-radius: 1000000px;
    transition: 0.125s;
  }

  .slider::before {
    position: absolute;
    width: 1.5em;
    height: 1.5em;
    content: '';
    background: var(--disabled-text);
    border-radius: 50%;
    transition: 0.125s;
    transform: translate(0%, -25%);
  }

  input:checked + .slider {
    background: var(--primary-bg);
  }

  input:checked + .slider::before {
    background: var(--primary);

    /* transform: translate(100%, -25%); */
    transform: translate(calc(2.3em - 1.5em), -25%);
  }
</style>
