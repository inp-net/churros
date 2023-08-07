<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';

  type Group = {
    uid: string;
    groupId: string;
    name: string;
    children: Group[];
    pictureFile: string;
    description: string;
  };
  export let group: Group;
  export let highlightUid = '';
</script>

<a class:highlight={highlightUid === group.uid} href="/club/{group.uid}/">
  <div class="avatar"><img src="{PUBLIC_STORAGE_URL}{group.pictureFile}" alt={group.name} /></div>
  <div class="text">
    <p class="name">{group.name}</p>
    {#if group.description}
      <p class="description">{group.description}</p>
    {/if}
  </div></a
>

{#if group.children.length > 0}
  <ul class="nobullet children">
    {#each group.children as child}
      <li>
        <svelte:self group={child} />
      </li>
    {/each}
  </ul>
{/if}

<style>
  .children {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    padding-left: 1rem;
    margin-top: 1rem;
    margin-left: 1rem;
    border-left: var(--border-block) dashed var(--muted-border);
  }

  .avatar {
    --size: 4rem;

    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--size);
    height: var(--size);
    overflow: hidden;
    font-size: 1rem;
    color: var(--muted-text);
    text-align: center;
    background-color: var(--muted-bg);
    border-radius: var(--radius-block);
  }

  .avatar img {
    object-fit: contain;
  }

  a {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .name {
    font-size: 1.25rem;
  }

  .highlight {
    font-weight: bold;
  }
</style>
