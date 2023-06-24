<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const emit = createEventDispatcher();
  export let value: string[] = [];

  $: emit('input', value);

  const asstring = (x: any) => x as string;
</script>

<div class="string-list-input">
  {#each value as v, i}
    <input
      type="text"
      on:blur={() => {
        if (!value[i]) value = value.filter((g) => g !== value[i]);
      }}
      bind:value={value[i]}
    />
  {/each}
  <input
    type="text"
    on:blur={(e) => {
      if (!e.target || !('value' in e.target)) return;
      const val = asstring(e.target.value);
      console.log(val);
      if (val) {
        value = [...value, val];
        e.target.value = '';
      }
    }}
  />
</div>

<style>
  .string-list-input {
    display: flex;
    justify-content: start;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>
