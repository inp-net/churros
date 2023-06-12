<script lang="ts">
  export let value: number[] = [];

  let valueToAdd: number;
</script>

<div class="integer-list-input">
  {#each value as v, i}
    <input
      type="number"
      on:blur={() => {
        if (value[i]) {
          value = value.filter((_, index) => index !== i);
        }
      }}
      bind:value={value[i]}
    />
  {/each}
  <input
    type="number"
    on:blur={(e) => {
      if (e.target.value) {
        value = [...value, e.target.value];
        e.target.value = null;
      }
    }}
  />
</div>
