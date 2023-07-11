<script lang="ts">
  import BaseInputText from './BaseInputText.svelte';
  import InputField from './InputField.svelte';

  export let value: Date | undefined | null;
  export let time = false;
  export let name: string | undefined = undefined;
  export let initial: Date | undefined = undefined;
  export let placeholder = '';
  export let required = false;
  export let label: string;
</script>

<InputField {label} {required}>
  <BaseInputText
    {placeholder}
    type={time ? 'datetime-local' : 'date'}
    bind:value
    {name}
    {initial}
    {required}
    {...$$restProps}
  />
</InputField>
