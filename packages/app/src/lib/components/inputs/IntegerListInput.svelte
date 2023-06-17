<script lang="ts">
  export let value: number[] = [];

  const asnumber = (x: any) => x as number;
</script>

<div class="integer-list-input">
  {#each value as v, i}
    <input
      type="number"
      on:blur={() => {
        if (!value[i]) value = value.filter((_, index) => index !== i);
      }}
      bind:value={value[i]}
    />
  {/each}
  <input
    type="number"
    on:blur={(e) => {
      if (!e.target || !('value' in e.target)) return;
      if (e.target.value) {
        value = [...value, asnumber(e.target.value)];
        e.target.value = undefined;
      }
    }}
  />
</div>

<style>
  .integer-list-input {
    display: flex;
    justify-content: start;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>
