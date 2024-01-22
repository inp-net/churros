<script lang="ts">
  import { isBefore } from 'date-fns';
  import InputDate from './InputDate.svelte';
  import InputField from './InputField.svelte';

  export let start: Date | undefined | null;
  export let end: Date | undefined | null;
  export let label: string;
  export let time = false;
  export let required = false;

  $: startBeforeEnd = !(start && end && isBefore(end, start));

  $: error = !startBeforeEnd ? 'La date de début doit être avant la date de fin' : undefined;
</script>

<InputField {required} {label} errors={error ? [error] : []}>
  <div class="date-range">
    <InputDate {error} {time} {required} label="" bind:value={start}></InputDate>
    <span class="separator">à</span>
    <InputDate {error} {time} {required} label="" bind:value={end}></InputDate>
  </div>
</InputField>

<style>
  .date-range {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>
