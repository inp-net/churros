<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const emit = createEventDispatcher();
  export let value: string[] = [];

  $: emit('input', value);
</script>

<div class="integer-list-input">
  {#each value as v, i}
    <input
      type="text"
      on:blur={() => {
        if (!value[i]) {
          value = value.filter((g) => g !== value[i]);
        }
      }}
      bind:value={value[i]}
    />
  {/each}
  <input
    type="text"
    on:blur={(e) => {
      const val = e.target.value;
      console.log(val);
      if (val) {
        value = [...value, val];
        e.target.value = '';
      }
    }}
  />
</div>
