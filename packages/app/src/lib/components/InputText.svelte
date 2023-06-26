<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import BaseInputText from './BaseInputText.svelte';
  import InputField from './InputField.svelte';

  export let name: string | undefined;
  export let initial: string | undefined;
  export let placeholder: string | undefined;
  export let value: string;
  export let required = false;
  export let autocomplete: string | undefined;
  export let errorMessage: string | undefined;
  export let messageIsWarning: boolean = false;
  export let actionIcon: typeof SvelteComponent | undefined;
  export let leftIcon: typeof SvelteComponent | undefined;
  export let suggestions: string[] | undefined;
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
    {leftIcon}
    {suggestions}
  />
</InputField>
