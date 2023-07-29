<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import { yearTier } from '$lib/dates';
  import AvatarPerson from './AvatarPerson.svelte';

  type User = {
    uid: string;
    firstName: string;
    lastName: string;
    children: User[];
    pictureFile: string;
    graduationYear: number;
  };
  export let user: User;
  export let highlightUid = '';
  $: console.log('<TreePersons>', user);
  $: role = (user: User) => `${yearTier(user.graduationYear)}A (${user.graduationYear})`;
</script>

<AvatarPerson
  role={role(user)}
  highlighted={highlightUid === user.uid}
  href="/user/{user.uid}"
  {...user}
/>

{#if user.children.length > 0}
  <ul class="nobullet children">
    {#each user.children as child}
      <li>
        <svelte:self role={role(child)} {highlightUid} user={child} />
      </li>
    {/each}
  </ul>
{/if}

<style>
  .children {
    margin-top: 1rem;
    margin-left: 1rem;
    padding-left: 1rem;
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    border-left: var(--border-block) dashed var(--muted-border);
  }
  .avatar {
    --size: 4rem;
    width: var(--size);
    height: var(--size);
    border-radius: var(--radius-block);
    background-color: var(--muted-bg);
    color: var(--muted-text);
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1rem;
    overflow: hidden;
  }
  .avatar img {
    object-fit: cover;
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
