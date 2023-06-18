<script lang="ts">
  import { formatDatetimeLocal } from '$lib/dates';

  export let value: Date | undefined;
</script>

<input
  type="datetime-local"
  value={value ? formatDatetimeLocal(value) : ''}
  on:input={({ target: { value: val } }) => {
    value = new Date(Date.parse(val));
  }}
/>
