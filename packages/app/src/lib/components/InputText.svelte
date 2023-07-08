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
  export let messageIsWarning = false;
  export let actionIcon: typeof SvelteComponent | undefined = undefined;
  export let suggestions: string[] | undefined = undefined;
  export let label: string;
</script>

<InputField {hint} {errors} {label} {required}>
  <BaseInputText
    {type}
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
  >
    <div class="slot-before" slot="before">
      <slot name="before" />
    </div>
  </BaseInputText>
</InputField>
