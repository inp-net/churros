<script lang="ts">
  import type { SvelteComponent } from 'svelte';
  import BaseInputText from './BaseInputText.svelte';
  import InputField from './InputField.svelte';

  export let type = 'text';
  export let name: string | undefined = undefined;
  export let hint = '';
  export let hintStyle: 'muted' | 'warning' | 'loading' | 'success' = 'muted';
  export let errors: string[] | undefined = [];
  export let initial: string | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let value: string;
  export let autocomplete: string | undefined = undefined;
  export let errorMessage: string | undefined = undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let actionIcon: typeof SvelteComponent<any> | undefined = undefined;
  export let label: string;
  export let focused = false;

  export let element: HTMLInputElement | undefined = undefined;
</script>

<InputField {hintStyle} {hint} {errors} {label} {...$$restProps}>
  <BaseInputText
    {type}
    bind:value
    bind:element
    bind:focused
    on:input
    on:change
    on:blur
    on:focus
    on:focusout
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
  <slot name="hint" slot="hint" />
</InputField>
