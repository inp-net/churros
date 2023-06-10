<script lang="ts">
  export let value: number[] = [];

  let valueToAdd: number;
</script>

<div class="integer-list-input">
  {#each value as v, i}
    <input type="number" bind:value={value[i]} />
  {/each}
  <input
    type="number"
    bind:value={valueToAdd}
    on:blur={() => {
      value = [...value, valueToAdd];
    }}
  />
</div>
