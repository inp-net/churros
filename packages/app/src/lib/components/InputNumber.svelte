<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import BaseInputText from './BaseInputText.svelte';
  import InputField from './InputField.svelte';

  export let name: string | undefined = undefined;
  export let hint = '';
  export let errors: string[] | undefined = [];
  export let initial: string | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let unit = '';
  export let value: number;
  export let required = false;
  export let autocomplete: string | undefined = undefined;
  export let errorMessage: string | undefined = undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let actionIcon: typeof SvelteComponent<any> | undefined = undefined;
  export let label: string;
</script>

<InputField {hint} {errors} {label} {required}>
  <BaseInputText
    type="number"
    inputmode="numeric"
    bind:value
    on:input
    on:change
    on:action
    {autocomplete}
    {name}
    {unit}
    {initial}
    {errorMessage}
    {placeholder}
    {required}
    {actionIcon}
  >
    <slot name="before" slot="before" />
  </BaseInputText>
</InputField>
