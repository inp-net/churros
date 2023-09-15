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
  export let autocomplete: string | undefined = undefined;
  export let errorMessage: string | undefined = undefined;
  export let actionIcon: typeof SvelteComponent<any> | undefined = undefined;
  export let label: string;
</script>

<InputField {hint} {errors} {label} {...$$restProps}>
  <BaseInputText
    {type}
    bind:value
    on:input
    on:change
    on:blur
    on:focus
    on:action
    {autocomplete}
    {name}
    {initial}
    {errorMessage}
    {placeholder}
    {actionIcon}
    {...$$restProps}
  >
    <slot name="before" slot="before" />
  </BaseInputText>
</InputField>
