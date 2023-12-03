<script lang="ts">
  import { format, isValid } from 'date-fns';
  import { createEventDispatcher } from 'svelte';
  import IconDelete from '~icons/mdi/backspace-outline';
  import BaseInputText from './BaseInputText.svelte';
  import InputField from './InputField.svelte';
  const dispatch = createEventDispatcher<{
    input: { value: Date | null | undefined };
  }>();

  export let value: Date | undefined | null;
  export let time = false;
  export let name: string | undefined = undefined;
  export let initial: Date | undefined = undefined;
  export let placeholder = '';
  export let required = false;
  export let label: string;
  export let element: HTMLInputElement | undefined = undefined;

  let dateValue: string | undefined | null = datePart(value);
  let timeValue: string | undefined | null = timePart(value);

  function datePart(datetime: Date | null | undefined) {
    if (!datetime) return datetime;
    if (!isValid(datetime)) return;
    try {
      return format(datetime, 'yyyy-MM-dd');
    } catch (error) {
      console.error(datetime, error);
    }
  }
  function timePart(datetime: Date | null | undefined) {
    if (!datetime) return datetime;
    if (!isValid(datetime)) return;
    try {
      return format(datetime, 'HH:mm');
    } catch (error) {
      console.error(datetime, error);
    }
  }

  $: if (time) {
    value = dateValue && timeValue ? new Date(`${dateValue}T${timeValue}`) : undefined;
    dispatch('input', { value });
  }
</script>

<InputField {label} {required}>
  {#if time}
    <div class="date-and-time">
      <input
        {required}
        type="date"
        name={name ? `${name}-date` : undefined}
        bind:value={dateValue}
      />
      <div class="separator"></div>
      <input
        {required}
        type="time"
        name={name ? `${name}-time` : undefined}
        bind:value={timeValue}
      />
    </div>
  {:else}
    <BaseInputText
      bind:element
      {placeholder}
      type={time ? 'datetime-local' : 'date'}
      actionIcon={required ? undefined : IconDelete}
      on:action={() => {
        // eslint-disable-next-line unicorn/no-null
        if (!required) value = null;
      }}
      bind:value
      {name}
      {initial}
      {required}
      {...$$restProps}
    />
  {/if}
</InputField>

<style>
  .date-and-time {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    align-items: center;
    justify-content: space-between;
    height: 2.5rem;
    overflow: hidden;
    border-radius: var(--radius-block);
  }

  .date-and-time input {
    flex-grow: 1;
    width: 50%;
    height: 100%;
    padding: 0.5rem;
    background: transparent;
    background-color: var(--default-bg);
    border: 0;
    border: var(--border-block) solid var(--border);
    border-radius: var(--radius-block);
  }

  .date-and-time input:first-child {
    border-right: none;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .date-and-time input:last-child {
    border-left: none;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .date-and-time .separator {
    width: var(--border-block);
    height: 100%;
    background-color: var(--border);
  }

  .date-and-time:focus-within .separator {
    background-color: var(--primary-border);
  }

  .date-and-time input:hover,
  .date-and-time input:focus-visible {
    background-color: var(--hover-bg);
  }

  .date-and-time input:focus-visible {
    border-color: var(--primary-border);
    outline: none;
  }
</style>
