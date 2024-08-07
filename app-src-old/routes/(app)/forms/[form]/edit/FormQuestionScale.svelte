<script lang="ts">
  import InputNumber from '$lib/components/InputNumber.svelte';
  import InputScale from '$lib/components/InputScale.svelte';

  export let minimumLabel: string;
  export let maximumLabel: string;
  export let minimum: number;
  export let maximum: number;
</script>

<InputScale noHint disabled label="" value={null} {minimum} {maximum} {minimumLabel} {maximumLabel}>
  <InputNumber label="" placeholder="Minimum" bind:value={minimum} slot="minimum"></InputNumber>
  <InputNumber min={minimum} label="" placeholder="Maximum" bind:value={maximum} slot="maximum"
  ></InputNumber>
</InputScale>
