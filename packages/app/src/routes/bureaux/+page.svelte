<script lang="ts">
  import CardGroup from '$lib/components/CardGroup.svelte';
  import CardPerson from '$lib/components/CardPerson.svelte';
  import { byMemberGroupTitleImportance } from '$lib/sorting';
  import type { PageData } from './$types';

  export let data: PageData;

  $: ({ groups } = data);
</script>

<h1>Bureaux</h1>

<ul class="nobullet">
  {#each groups as group}
    <li>
      <CardGroup href="/club/{group.uid}" {...group} />
      {#each group.members.sort(byMemberGroupTitleImportance) as { member, title }}
        <CardPerson href="/user/{member.uid}" {...member} />
      {/each}
    </li>
  {/each}
</ul>

<style>
  h1 {
    margin-bottom: 2rem;
    text-align: center;
  }

  ul {
    display: flex;
    flex-flow: column wrap;
  }

  li {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }

  li > :global(a:first-child) {
    width: 250px !important;
  }

  li > :global(a:not(:first-child)) {
    width: 175px !important;
  }
</style>
