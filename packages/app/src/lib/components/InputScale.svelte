<script lang="ts">
  import InputField from '$lib/components/InputField.svelte';

  export let label: string;
  export let required = false;
  export let id = '';
  export let hint = '';
  export let errors: string[] = [];
  export let value: number;
  export let minimum: number;
  export let maximum: number;
  export let minimumLabel: string;
  export let maximumLabel: string;
</script>

<InputField {label} {required} {hint} {errors}>
  <div class="range-input">
    <span class="label-min">{minimumLabel || minimum}</span>
    <input type="range" bind:value name={id} {id} min={minimum} max={maximum} step="1" />
    <span class="label-max">{maximumLabel || maximum}</span>
    <p class="current-value-hint">{value}/{maximum}</p>
  </div>
</InputField>

<style>
  .range-input {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }

  input {
    flex: 1;
    min-width: 0;
  }
</style>
