<script lang="ts">
  type Group = {
    groupId: string;
    name: string;
    children: Group[];
  };
  export let group: Group;
</script>

{group.name}

{#if group.children.length > 0}
  <ul>
    {#each group.children as child}
      <li><svelte:self group={child} /></li>
    {/each}
  </ul>
{/if}
