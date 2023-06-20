<script lang="ts">
  import { formatDatetimeLocal } from '$lib/dates';

  export let value: Date | undefined;
  export const asstring = (x: any) => x as string;
</script>

<input
  type="datetime-local"
  value={value ? formatDatetimeLocal(value) : ''}
  on:input={(e) => {
    if (!(e.target && 'value' in e.target)) return;
    value = new Date(Date.parse(asstring(e.target.value)));
  }}
/>
