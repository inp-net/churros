<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  type School = { id: number; name: string; color: string };

  const emit = createEventDispatcher();
  export let value: School[] = [];

  $: emit('input', value);
</script>

<div class="integer-list-input">
  {#each value as v, i}
    <input
      type="text"
      on:blur={(e) => {
        const val = e.target.value;
        if (!val) value = value.filter((g) => g.name !== val);
      }}
      bind:value={value[i].name}
    />
  {/each}
  <input
    type="text"
    on:blur={(e) => {
      const val = e.target.value;
      console.log(val);
      if (val) {
        value = [
          ...value,
          {
            name: val,
            id: Math.floor(Math.random() * 1000),
            color: '#000000',
          },
        ];
        e.target.value = '';
      }
    }}
  />
</div>
