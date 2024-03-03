<script lang="ts">
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import CardMajor from '$lib/components/CardMajor.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ Documents } = data);

  function mySchoolsFirst(a: { uid: string }, b: { uid: string }) {
    if ($Documents.data?.me.major?.schools.some((s) => s.uid === a.uid)) {
      return -1;
    }
    if ($Documents.data?.me.major?.schools.some((s) => s.uid === b.uid)) {
      return 1;
    }
    return 0;
  }
</script>

<Breadcrumbs root="/documents/"></Breadcrumbs>

{#if !$Documents.data}
  <LoadingSpinner></LoadingSpinner> Chargement
{:else}
  {#each $Documents.data.schools.sort(mySchoolsFirst) as school}
    <section class="majors-of-school">
      <h2 class="typo-field-label">{school.name}</h2>
      <ul class="nobullet">
        {#each school.majors as major}
          <li>
            <CardMajor href="./{major.uid}" {major}></CardMajor>
          </li>
        {/each}
      </ul>
    </section>
  {/each}
{/if}

<style>
  ul {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  h2 {
    margin-top: 1.5rem;
    margin-bottom: 1em;
    font-size: 1rem;
    font-weight: bold;
  }
</style>
