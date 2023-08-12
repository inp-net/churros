<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import BaseInputText from './BaseInputText.svelte';
  import InputField from './InputField.svelte';

  export let type = 'text';
  export let name: string | undefined = undefined;
  export let hint = '';
  export let errors: string[] | undefined = [];
  export let initial: string | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let value: string;
  export let required = false;
  export let autocomplete: string | undefined = undefined;
  export let errorMessage: string | undefined = undefined;
  export let actionIcon: typeof SvelteComponent | undefined = undefined;
  export let label: string;
  export let readonly = false;
</script>

<InputField {hint} {errors} {label} {required}>
  <BaseInputText
    {type}
    bind:value
    on:input
    on:change
    on:action
    {autocomplete}
    {name}
    {initial}
    {errorMessage}
    {placeholder}
    {required}
    {readonly}
    {actionIcon}
  >
    <slot name="before" slot="before" />
  </BaseInputText>
</InputField>
