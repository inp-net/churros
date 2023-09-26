<script lang="ts">
  import { page } from '$app/stores';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import CardSubject from '$lib/components/CardSubject.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  const minors = Object.values(
    Object.fromEntries(
      data.subjectsOfMajor.edges.flatMap(({ node }) => node.minors).map((m) => [m.uid, m]),
    ),
  );
</script>

<Breadcrumbs root="/documents">
  <Breadcrumb href="..">{data.major.shortName}</Breadcrumb>
  <Breadcrumb>{$page.params.yearTier.toUpperCase()}</Breadcrumb>
</Breadcrumbs>

{#each minors as minor}
  <h2>{minor.name}</h2>

  <ul class="nobullet">
    {#each data.subjectsOfMajor.edges.filter( ({ node }) => node.minors.some((m) => m.uid === minor.uid), ) as { node }}
      <li>
        <CardSubject href="./{node.uid}" majors={[]} {...node}></CardSubject>
      </li>
    {/each}
  </ul>
{/each}

<style>
  h2 {
    margin-top: 2rem;
    margin-bottom: 0.5rem;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
