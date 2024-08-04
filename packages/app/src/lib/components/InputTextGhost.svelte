<script lang="ts">
  import { loaded, type MaybeLoading } from '$lib/loading';
  import { tooltip } from '$lib/tooltip';
  import { createEventDispatcher, tick } from 'svelte';
  const dispatch = createEventDispatcher<{ input: Value; blur: Value; focus: Value }>();

  /** Shown to screen readers only, or via a tooltip when value is empty */
  export let label: string;

  type Type = $$Generic<string>;
  type Value = $$Generic<Type extends 'date' ? Date | null : string>;

  export let placeholder: string;
  // @ts-expect-error "could be instanciated with a different subtype"
  export let type: Type = 'text';
  export let value: MaybeLoading<Value>;
  let _value = (type === 'date' ? null : '') as Value;

  $: if (loaded(value)) _value = value;

  function coerce(stringified: string): Value {
    if (type === 'date') 
      return (stringified ? new Date(stringified) : null) as Value;
    
    return stringified as Value;
  }

  function stringify(value: Value): string {
    if (type === 'date') 
      return value ? (value as Date).toISOString().split('T')[0] : '';
    
    return value as string;
  }

  async function updateValue(underlying: Value) {
    dispatch('input', underlying);
    await tick();
    value = underlying;
  }
</script>

<div class="input-with-indicator">
  <!-- TODO allow a slot to add content to the right, to e.g. show an indicator that the field was saved -->
  <input
    {type}
    {...$$restProps}
    on:focus={() => {
      dispatch('focus', _value);
    }}
    on:blur={() => {
      dispatch('blur', _value);
    }}
    value={stringify(_value)}
    on:input={({ currentTarget }) => {
      updateValue(coerce(currentTarget.value));
    }}
    use:tooltip={value ? undefined : label}
    placeholder={loaded(value) ? placeholder : 'Chargement…'}
    disabled={!loaded(value)}
    aria-label={label}
  />
  <!-- We have to do this instead of just border-bottom because CSS doesn't allow customizing the dash size and gaps… -->
  <svg class="underline">
    <line x1="0" y1="100%" x2="100%" y2="100%" stroke="currentColor" stroke-width="0" />
  </svg>
</div>

<style>
  .input-with-indicator {
    display: flex;
    flex-direction: column;

    --underline-width: calc(4 * var(--border-block));
  }

  input {
    display: inline-flex;
    width: 100%;
    padding: 0;
    margin-bottom: calc(-1 * var(--underline-width));
    font: inherit;
    font-size: 1em;
    color: inherit;
    background: none;
    border: none;
  }

  .underline {
    width: 100%;
    height: var(--underline-width);
    color: transparent;

    /*  FIXME: does not work. instead, make a second line and transition it in with a scale transform */
    transition: all 250ms ease;
  }

  input:not(:placeholder-shown) + .underline line {
    stroke: var(--muted);
    stroke-dasharray: 5;
    stroke-width: var(--border-block);
  }

  input:focus {
    outline: none;
  }

  input:focus + .underline line {
    stroke: var(--primary);
    stroke-dasharray: none;
    stroke-width: var(--underline-width);
  }

  input::placeholder {
    color: var(--muted);
  }
</style>
