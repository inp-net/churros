<script lang="ts">
  import type { MaybeLoading } from '$lib/loading';
  import type { SvelteComponent } from 'svelte';
  import BaseInputText from './BaseInputText.svelte';
  import InputField from './InputField.svelte';

  export let name: string | undefined = undefined;
  export let hint = '';
  export let errors: string[] | undefined = [];
  export let initial: MaybeLoading<number> | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let unit = '';
  export let value: number;
  export let required = false;
  export let autocomplete: string | undefined = undefined;
  export let errorMessage: string | undefined = undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let actionIcon: typeof SvelteComponent<any> | undefined = undefined;
  export let label: string;
  export let help = '';

  export let min: number | undefined = undefined;
  export let max: number | undefined = undefined;
</script>

<InputField {hint} {errors} {label} {required}>
  <BaseInputText
    type="number"
    inputmode="decimal"
    bind:value
    on:input
    on:change
    on:blur
    on:action
    {help}
    {autocomplete}
    {name}
    {unit}
    {initial}
    {errorMessage}
    {placeholder}
    {required}
    {actionIcon}
    {min}
    {max}
  >
    <slot name="before" slot="before" />
  </BaseInputText>
</InputField>
