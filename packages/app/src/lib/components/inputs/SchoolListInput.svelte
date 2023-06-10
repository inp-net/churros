<script lang="ts">
  type School = { id: number; name: string; color: string };
  export let value: School[] = [];

  let valueToAdd: School;
</script>

<div class="integer-list-input">
  {#each value as v, i}
    <input type="text" bind:value={value[i]} />
  {/each}
  <input
    type="text"
    bind:value={valueToAdd}
    on:blur={() => {
      value = [...value, valueToAdd];
    }}
  />
</div>
