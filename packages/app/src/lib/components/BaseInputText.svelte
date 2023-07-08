<script lang="ts">
  import { type SvelteComponent, createEventDispatcher, onMount } from 'svelte';
  import IconReset from '~icons/mdi/reload';
  import InputWithSuggestions from './InputWithSuggestions.svelte';
  import { tooltip } from '$lib/tooltip';
  const emit = createEventDispatcher();

  export let type: HTMLInputElement['type'];
  export let value: string | number | Date | null | undefined;
  export let autocomplete: string | undefined = undefined;
  export let name: string | undefined = undefined;
  export let initial: string | number | Date | null | undefined = undefined;
  export let unit = '';
  export let placeholder = '';
  export let validate: (value: string) => string = () => '';
  export let actionIcon: typeof SvelteComponent | undefined = undefined;
  export let suggestions: string[] | undefined = undefined;
  export let required = false;
  export let closeKeyboardOnEnter = false;

  let showEmptyErrors = false;
  let valueString: string =
    type === 'date' && value instanceof Date
      ? value?.toISOString()?.split('T')[0]
      : value?.toString() ?? '';

  $: {
    switch (type) {
      case 'number': {
        value = Number(valueString.replace(',', '.'));
        break;
      }

      case 'date': {
        value = new Date(valueString);
        if (!value.valueOf()) {
          value = undefined;
          valueString = '';
        }

        break;
      }

      default: {
        value = valueString;
      }
    }
  }

  export let errorMessage = '';
  let _errorMessage = '';
  export let messageIsWarning = false;
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
    } else {
      _errorMessage = validate(valueString);
    }
  }

  let errored = false;
  $: errored = _errorMessage !== '';

  let resettable = false;
  $: resettable = typeof initial !== 'undefined' && value !== initial;

  let focused = false;

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

<div
  class="wrapper base-input typo-paragraph"
  class:danger={errored}
  class:primary={focused}
  style:--intense="var(--{messageIsWarning ? 'safran' : 'blood'})"
  style:--pale="var(--{messageIsWarning ? 'plaster' : 'rose'})"
>
  <div class="input-area" bind:this={inputContainer}>
    {#if $$slots.before}
      <div class="left-icon">
        <slot name="before" />
      </div>
    {/if}
    {#if suggestions}
      <InputWithSuggestions
        class="{errored ? 'danger' : ''} {focused ? 'primary' : ''}"
        on:close-suggestions
        on:select
        on:input
        {inputContainer}
        {autocomplete}
        items={suggestions}
        {required}
        {name}
        bind:text={valueString}
        {placeholder}
        on:keypress={(e) => {
          if (!(e instanceof KeyboardEvent)) return;
          if (!(e.target instanceof HTMLInputElement)) return;
          if (e.key === 'Enter' && closeKeyboardOnEnter) e.target.blur();
        }}
        on:focus={() => {
          focused = true;
        }}
        on:blur={() => {
          focused = false;
        }}
        on:input={(e) => {
          if (valueString !== '') showEmptyErrors = true;
          emit('input', e);
        }}
      />
    {:else}
      <input
        class:danger={errored}
        class:primary={focused}
        on:keyup
        on:keypress={(e) => {
          if (!(e.target instanceof HTMLInputElement)) return;
          if (e.key === 'Enter' && closeKeyboardOnEnter) e.target.blur();
        }}
        {type}
        {name}
        value={valueString}
        {required}
        {autocomplete}
        {placeholder}
        on:input={(e) => {
          if (!(e.target instanceof HTMLInputElement)) return;
          valueString = e.target?.value;
          if (valueString === undefined) valueString = '';
          if (valueString !== '') showEmptyErrors = true;
          emit('input', e);
        }}
        on:focus={() => {
          focused = true;
        }}
        on:blur={() => {
          focused = false;
        }}
      />
    {/if}
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
    background: none;
    border: none;
    outline: none;
    appearance: textfield;
  }

  .wrapper:hover,
  .wrapper:focus-within,
  .wrapper:hover input,
  .wrapper:focus-within input {
    color: var(--hover-text);
    background: var(--hover-bg);
    border-color: var(--hover-border);
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
    appearance: none;
    margin: 0;
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
    width: 1.5rem;
    height: 1.5rem;
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
