<script lang="ts">
  import InputField from '$lib/components/InputField.svelte';

  export let label: string;
  export let required = false;
  export let hint = '';
  export let errors: string[] = [];
  export let value: number;
  export let minimum: number;
  export let maximum: number;
  export let minimumLabel: string;
  export let maximumLabel: string;
  export let name = '';
  export let id = name;
</script>

<InputField {label} {required} {hint} {errors}>
  <div class="range-input">
    <span class="label label-min typo-details">{minimumLabel || minimum}</span>
    <span class="label label-max typo-details">{maximumLabel || maximum}</span>
  </div>
  <input type="range" bind:value {name} {id} min={minimum} max={maximum} step="1" />
  <p class="current-value-hint">{value}/{maximum}</p>
</InputField>

<style>
  .range-input {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .label {
    white-space: pre;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .current-value-hint {
    width: 4ch;
    text-align: right;
    width: 100%;
  }

  input {
    flex: 1;
    min-width: 0;
    width: 100%;
  }
</style>
