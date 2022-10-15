<script lang="ts">
  type Group = {
    uid: string;
    groupId: string;
    name: string;
    children: Group[];
  };
  export let group: Group;
</script>

<a href="/club/{group.uid}">{group.name}</a>

{#if group.children.length > 0}
  <ul>
    {#each group.children as child}
      <li><svelte:self group={child} /></li>
    {/each}
  </ul>
{/if}
