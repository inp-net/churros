<script lang="ts">
  import { groupLogoSrc } from '$lib/logos';
  import { isDark } from '$lib/theme';

  type Group = {
    uid: string;
    groupId: string;
    name: string;
    studentAssociation?: { school: { name: string } } | undefined;
    children: Group[];
    pictureFile: string;
    pictureFileDark: string;
    description: string;
  };
  export let group: Group;
  export let highlightUid = '';
  export let showSchool = false;
</script>

<a class:highlight={highlightUid === group.uid} href="/groups/{group.uid}/">
  <div class="avatar">
    <img src={groupLogoSrc($isDark, group)} alt={group.name} />
  </div>
  <div class="text">
    <p class="name">
      {group.name}
      {#if group.studentAssociation && showSchool}
        <span class="school">
          {group.studentAssociation?.school?.name}
        </span>
      {/if}
    </p>
    {#if group.description}
      <p class="description">{group.description}</p>
    {/if}
  </div></a
>

{#if group.children.length > 0}
  <ul class="nobullet children">
    {#each group.children as child}
      <li>
        <svelte:self group={child} {highlightUid} />
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
    background: var(--muted-bg);
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

  .description {
    font-size: 0.9em;
  }

  .highlight {
    font-weight: bold;
    color: var(--primary);
  }

  .school {
    font-size: 0.75em;
    font-weight: bold;
    color: var(--muted-text);
  }

  .school::before {
    margin-right: 0.25em;
    content: '·';
  }

  .highlight .name {
    font-weight: bold;
  }

  .highlight .description {
    font-weight: bold;
  }
</style>
