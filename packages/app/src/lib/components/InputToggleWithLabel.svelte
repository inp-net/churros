<script lang="ts">
  import InputToggle from '$lib/components/InputToggle.svelte';
  import { LoadingText, type MaybeLoading } from '$lib/loading';

  type Value = $$Generic<MaybeLoading<boolean> | boolean>;

  export let value: Value;
  export let label: MaybeLoading<string>;
</script>

<label class="switch-container">
  <slot name="label" {label}><LoadingText value={label}></LoadingText></slot>
  <InputToggle bind:value on:change />
</label>

<style>
  .switch-container {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: space-between;
  }
</style>
