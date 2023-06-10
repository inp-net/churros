<script lang="ts">
  type Group = { uid: string; name: string; pictureFile: string };
  export let value: Group[] = [];

  let valueToAdd: Group;
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
