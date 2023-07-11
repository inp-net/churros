<script lang="ts">
  type Group = {
    uid: string;
    groupId: string;
    name: string;
    children: Group[];
  };
  export let group: Group;
  export let highlightUid = '';
</script>

<a class:highlight={highlightUid === group.uid} href="/club/{group.uid}/">{group.name}</a>

{#if group.children.length > 0}
  <ul>
    {#each group.children as child}
      <li>
        <a href="/club/{child.uid}" class:highlight={highlightUid === child.uid}>
          <svelte:self group={child} />
        </a>
      </li>
    {/each}
  </ul>
{/if}

<style>
  .highlight {
    font-weight: bold;
  }
</style>
