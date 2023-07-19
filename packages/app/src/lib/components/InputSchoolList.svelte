<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  type School = { uid: string; name: string; color: string };

  const emit = createEventDispatcher();
  export let value: School[] = [];

  $: emit('input', value);

  const asstring = (x: any) => x as string;
</script>

<div class="school-list-input">
  {#each value as v, i}
    <input
      type="text"
      on:blur={(e) => {
        if (!e.target || !('value' in e.target)) return;
        const val = asstring(e.target.value);
        if (!val) value = value.filter((g) => g.name !== val);
      }}
      bind:value={value[i].name}
    />
  {/each}
  <input
    type="text"
    on:blur={(e) => {
      if (!e.target || !('value' in e.target)) return;
      const val = asstring(e.target.value);
      if (val) {
        value = [
          ...value,
          {
            name: val,
            uid: 'school:' + Math.floor(Math.random() * 1000),
            color: '#000000',
          },
        ];
        e.target.value = '';
      }
    }}
  />
</div>
