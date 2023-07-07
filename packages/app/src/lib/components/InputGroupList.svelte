<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  type Group = { uid: string; name: string; pictureFile: string };

  const emit = createEventDispatcher();
  export let value: Group[] = [];

  $: emit('input', value);

  const asstring = (x: any) => x as string;
</script>

<div class="integer-list-input">
  {#each value as v, i}
    <input
      type="text"
      on:blur={(e) => {
        if (!e.target || !('value' in e.target)) return;
        const val = e.target.value;
        if (!val) value = value.filter((g) => g.uid !== val);
      }}
      bind:value={value[i].uid}
    />
  {/each}
  <input
    type="text"
    on:blur={(e) => {
      if (!e.target || !('value' in e.target)) return;
      const val = asstring(e.target.value);
      console.log(val);
      if (val) {
        value = [
          ...value,
          {
            uid: val,
            name: val,
            pictureFile: '',
          },
        ];
        e.target.value = '';
      }
    }}
  />
</div>
