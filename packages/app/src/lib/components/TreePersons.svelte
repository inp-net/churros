<script lang="ts">
  import { yearTier } from '$lib/dates';
  import AvatarPerson from './AvatarPerson.svelte';

  type User = {
    uid: string;
    firstName: string;
    lastName: string;
    fullName: string;
    children: User[];
    pictureFile: string;
    graduationYear: number;
  };
  export let user: User;
  export let highlightUid = '';
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
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    padding-left: 1rem;
    margin-top: 1rem;
    margin-left: 1rem;
    border-left: var(--border-block) dashed var(--muted-border);
  }
</style>
