<script lang="ts">
  import BaseInputText from './BaseInputText.svelte';
  import InputField from './InputField.svelte';

  export let value: Date | null;
  export let type: 'date' | 'datetime';
  export let name: string | undefined = undefined;
  export let initial: Date | undefined = undefined;
  export let placeholder = '';
  export let required = false;
  export let label: string;
</script>

<InputField {label} {required}>
  <BaseInputText
    {placeholder}
    type={type === 'datetime' ? 'datetime-local' : 'date'}
    bind:value
    {name}
    {initial}
    {required}
  />
</InputField>
