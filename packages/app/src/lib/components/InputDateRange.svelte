<script lang="ts">
  import InputDate from './InputDate.svelte';
  import InputField from './InputField.svelte';

  export let start: Date | undefined | null;
  export let end: Date | undefined | null;
  export let label: string;
  export let time = false;
  export let required = false;
</script>

<InputField {required} {label}>
  <div class="date-range">
    <InputDate {time} {required} label="" bind:value={start}></InputDate>
    <span class="separator">à</span>
    <InputDate {time} {required} label="" bind:value={end}></InputDate>
  </div>
</InputField>

<style>
  .date-range {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>
