<script lang="ts">
  import BaseInputText from './BaseInputText.svelte';
  import InputField from './InputField.svelte';
  import IconDelete from '~icons/mdi/backspace-outline';

  export let value: Date | undefined | null;
  export let time = false;
  export let name: string | undefined = undefined;
  export let initial: Date | undefined = undefined;
  export let placeholder = '';
  export let required = false;
  export let label: string;
  export let element: HTMLInputElement | undefined = undefined;
</script>

<InputField {label} {required}>
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
</InputField>
