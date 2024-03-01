<script lang="ts">
  import { fragment, graphql } from '$houdini';
  import CardGroup from '$lib/components/CardGroup.svelte';
  import { canCreateArticle } from '$lib/permissions';
  import type { PageData } from './$houdini';

  export let data: PageData;

  $: ({ MyGroupMemberships } = data);
  $: ({
    me: { groups },
  } = $MyGroupMemberships.data ?? {
    me: { groups: [] },
  });
</script>

<div class="content">
  <h1>Écrire un post en tant que</h1>

  <section class="groups">
    {#each groups as { group } (group.uid)}
      <CardGroup href="/posts/{group.uid}/create" {group} />
    {/each}
  </section>
</div>

<style>
  .content {
    display: flex;
    flex-flow: column wrap;
    gap: 2rem;
  }

  h1 {
    text-align: center;
  }

  .groups {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
</style>
