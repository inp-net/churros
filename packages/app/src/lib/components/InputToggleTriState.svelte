<script lang="ts">
  import { loaded, type MaybeLoading } from '$lib/loading';
  import { createEventDispatcher, SvelteComponent } from 'svelte';

  const dispatch = createEventDispatcher<{ update: boolean }>();

  type EnumValue1 = $$Generic;
  type EnumValue2 = $$Generic;
  type EnumValue3 = $$Generic;
  type EnumValue = EnumValue1 | EnumValue2 | EnumValue3;
  type Value = $$Generic<MaybeLoading<EnumValue> | EnumValue>;

  export let value: Value;

  /** [off state, middle/interderminate state, on state] */
  export let options: [EnumValue1, EnumValue2, EnumValue3];
  $: [offstate, middlestate, onstate] = options;

  /** For assistive technologies */
  export let labels: Array<[EnumValue, string]>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let icons: Array<[EnumValue, typeof SvelteComponent<any>]> = [];
  $: icon = icons.find(([value]) => value === _value)?.[1];

  let _value: boolean;
  $: if (_value === undefined && loaded(value)) _value = value as boolean;
</script>

<div
  class="switch"
  role="switch"
  aria-label={labels.find(([v]) => v === _value)?.[1]}
  aria-checked={_value === undefined ? 'mixed' : _value ? 'true' : 'false'}
>
  <input
    on:change={() => {
      dispatch('update', _value);
    }}
    type="radio"
    bind:group={_value}
    value={offstate}
  />
  <input
    on:change={() => {
      dispatch('update', _value);
    }}
    type="radio"
    bind:group={_value}
    value={middlestate}
  />
  <input
    on:change={() => {
      dispatch('update', _value);
    }}
    type="radio"
    bind:group={_value}
    value={onstate}
  />
  <div
    data-value={_value === offstate ? 'off' : _value === middlestate ? 'middle' : 'on'}
    class="slider"
  >
    {#if icon}
      <div class="icon">
        <svelte:component this={icon}></svelte:component>
      </div>
    {/if}
  </div>
</div>

<style>
  /* The switch - the three radio buttons act as hit boxes */
  .switch {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  /* Visually hide*/
  .switch input {
    z-index: 1;
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

  .slider .icon {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    inset: 0;
  }

  .slider::before {
    position: absolute;
    width: 1.5em;
    height: 1.5em;
    content: '';
    background-color: var(--disabled-text);
    border-radius: 50%;
    transition: 0.125s;
    transform: translate(0%, -25%);
  }

  .slider[data-value='on'] {
    background-color: var(--primary-bg);
  }

  .slider[data-value='on']::before {
    background-color: var(--primary);

    /* transform: translate(100%, -25%); */
    transform: translate(calc(2.3em - 1.5em), -25%);
  }

  .slider[data-value='middle'] {
    background-color: var(--bg4);
  }

  .slider[data-value='middle']::before {
    background-color: var(--bg);

    /* transform: translate(50%, -25%); */
    transform: translate(calc(1.15em - 0.75em), -25%);
  }
</style>
