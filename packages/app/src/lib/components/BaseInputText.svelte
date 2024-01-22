<script lang="ts">
  import { type SvelteComponent, createEventDispatcher, onMount } from 'svelte';
  import IconReset from '~icons/mdi/reload';
  import { tooltip } from '$lib/tooltip';
  import { format } from 'date-fns';
  const emit = createEventDispatcher();

  export let type: HTMLInputElement['type'];
  export let value: string | number | Date | null | undefined;
  export let autocomplete: string | undefined = undefined;
  export let name: string | undefined = undefined;
  export let initial: string | number | Date | null | undefined = undefined;
  export let unit = '';
  export let placeholder = '';
  export let validate: (value: string) => string = () => '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let actionIcon: typeof SvelteComponent<any> | undefined = undefined;
  export let required = false;
  export let closeKeyboardOnEnter = false;
  export let element: HTMLInputElement | undefined = undefined;
  export let focused = false;

  // TODO use (HTMLInputElement).valueAsDate instead
  function stringifyValue(val: typeof value, type: string): string {
    if (val === undefined || val === null) return '';
    switch (type) {
      case 'date': {
        return (val as Date).toISOString().split('T')[0];
      }

      case 'datetime-local':
      case 'datetime': {
        if (typeof val === 'string') return val;
        return format(val as Date, "yyyy-MM-dd'T'HH:mm");
      }

      default: {
        return val?.toString() ?? '';
      }
    }
  }

  let showEmptyErrors = false;
  let valueString: string = stringifyValue(value, type);

  function fromStringifiedValue(valueString: string): typeof value {
    switch (type) {
      case 'number': {
        const number = Number(valueString.replace(',', '.'));
        if (Number.isNaN(number)) return 0;

        return number;
      }

      case 'date':
      case 'datetime-local':
      case 'datetime': {
        const date = new Date(valueString);
        if (!date.valueOf()) return undefined;

        return date;
      }

      default: {
        return valueString;
      }
    }
  }

  export let errorMessage = '';
  let _errorMessage = '';
  $: {
    if (valueString === '' && !showEmptyErrors) {
      _errorMessage = '';
    } else if (errorMessage !== '') {
      _errorMessage = errorMessage;
    } else if (valueString === '' && showEmptyErrors && required) {
      _errorMessage = 'Ce champ est requis';
    } else if (type === 'number' && valueString === '' && required) {
      // Validate string conversion first
      _errorMessage = 'Ce champ doit être un nombre';
    } else if (type === 'date' && value === null) {
      _errorMessage = '';
    } else if ($$restProps.minlength && valueString.length < $$restProps.minlength) {
      _errorMessage = `Ce champ doit comporter au moins ${$$restProps.minlength} caractère${
        $$restProps.minlength > 1 ? 's' : ''
      }`;
    } else {
      _errorMessage = validate(valueString);
    }
  }

  let errored = false;
  $: errored = _errorMessage !== '';

  let resettable = false;
  $: resettable = initial !== undefined && value !== initial;

  let inputContainer: HTMLDivElement;

  onMount(() => {
    inputContainer
      .closest('form')
      ?.querySelector('button[type=submit]')
      ?.addEventListener('click', () => {
        showEmptyErrors = true;
      });
  });
</script>

<div class="wrapper base-input typo-paragraph" class:danger={errored} class:focused>
  <div class="input-area" bind:this={inputContainer}>
    {#if $$slots.before}
      <div class="left-icon">
        <slot name="before" />
      </div>
    {/if}
    <input
      bind:this={element}
      class:danger={errored}
      class:focused
      on:change
      on:blur
      on:focusout
      on:focus
      on:keyup
      on:keypress={(e) => {
        if (!(e.target instanceof HTMLInputElement)) return;
        if (e.key === 'Enter' && closeKeyboardOnEnter) e.target.blur();
      }}
      type={type === 'number' ? 'text' : type}
      inputmode={type === 'number' ? 'numeric' : undefined}
      pattern={type === 'number' ? '[0-9.,]*' : undefined}
      {name}
      value={stringifyValue(value, type)}
      required={required || undefined}
      {autocomplete}
      {placeholder}
      {...$$restProps}
      on:input={(e) => {
        if (!(e.target instanceof HTMLInputElement)) return;
        valueString = e.target?.value;
        if (valueString === undefined) valueString = '';
        if (valueString !== '') showEmptyErrors = true;
        value = fromStringifiedValue(valueString);
        emit('input', e);
      }}
      on:focus={() => {
        focused = true;
      }}
      on:blur={() => {
        focused = false;
      }}
    />
    {#if actionIcon}
      <button type="button" class="action" on:click={() => emit('action')}>
        <svelte:component this={actionIcon} />
      </button>
    {/if}
    {#if initial !== undefined}
      <button
        disabled={!resettable}
        type="button"
        class="reset"
        use:tooltip={resettable ? `Revenir à ${JSON.stringify(initial)}` : ''}
        on:click|stopPropagation={() => {
          value = initial;
          valueString =
            type === 'date' && value instanceof Date
              ? value?.toISOString()?.split('T')[0]
              : value?.toString() ?? '';
        }}
      >
        {#if resettable}
          <IconReset />
        {/if}
      </button>
    {:else}
      <span class="unit">{unit}</span>
    {/if}
  </div>
  {#if errored}
    <div class="error-area">
      <p class="typo-details error-message">{_errorMessage}</p>
    </div>
  {/if}
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    color: var(--text);
    background: var(--bg);
    border: var(--border-block) solid var(--border);
    border-radius: var(--radius-block);
  }

  input {
    width: 100%;
    color: var(--text);
    appearance: textfield;
    background: none;
    border: none;
    outline: none;
  }

  .wrapper:hover,
  .wrapper:hover input,
  .wrapper:focus-within,
  .wrapper:focus-within input {
    color: var(--hover-text);
    background: var(--hover-bg);
  }

  .wrapper:hover,
  .wrapper:hover input {
    border-color: var(--hover-border);
  }

  .wrapper:focus-within,
  .wrapper:focus-within input {
    border-color: var(--primary-border);
  }

  .wrapper > div {
    padding: 0.5rem 0.6667rem;
  }

  .input-area {
    position: relative;
    display: flex;
    align-items: center;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    margin: 0;
    appearance: none;
  }

  button.reset,
  button.action {
    width: 1.5rem;
    height: 1.25rem;
    padding: 0;
    cursor: pointer;
    background-color: transparent;
    border: none;
  }

  .left-icon {
    margin-right: 0.5rem;
  }

  .unit,
  .left-icon,
  .action,
  .reset {
    color: var(--text);
  }

  .left-icon:empty {
    display: none;
  }
</style>
