<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import BaseInputText from './BaseInputText.svelte';
  import InputField from './InputField.svelte';

  export let name: string | undefined = undefined;
  export let initial: string | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let value: string;
  export let required = false;
  export let autocomplete: string | undefined = undefined;
  export let errorMessage: string | undefined = undefined;
  export let messageIsWarning = false;
  export let actionIcon: typeof SvelteComponent | undefined = undefined;
  export let suggestions: string[] | undefined = undefined;
  export let label: string;
</script>

<InputField {label} {required}>
  <BaseInputText
    type="text"
    bind:value
    on:input
    on:action
    {autocomplete}
    {name}
    {initial}
    {errorMessage}
    {messageIsWarning}
    {placeholder}
    {required}
    {actionIcon}
    {suggestions}
  />
</InputField>
