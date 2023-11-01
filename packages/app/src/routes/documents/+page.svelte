<script lang="ts">
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import CardMajor from '$lib/components/CardMajor.svelte';
  import groupBy from 'lodash.groupby';
  import type { PageData } from './$types';
  import { me } from '$lib/session';

  export let data: PageData;

  const majorsBySchool = Object.entries(groupBy(data.majors, (m) => m.schools[0]?.uid))
    .map(([schoolUid, majors]) => [schoolUid, majors.filter((m) => m.subjects.length > 0)])
    .filter(([_, majors]) => majors.length > 0)
    .sort(([schoolUid]) => {
      // Put schools of the user first
      if ($me?.major.schools.some((s) => s.uid === schoolUid)) return -1;
      return 1;
    }) as Array<[string, typeof data.majors]>;
</script>

<Breadcrumbs root="/documents"></Breadcrumbs>

{#each majorsBySchool as [schoolUid, majorsOfSchool]}
  {@const school = data.schools.find((s) => s.uid === schoolUid)}
  <section class="majors-of-school">
    {#if school}
      <h2 class="typo-field-label">{school.name}</h2>
    {:else}
      <pre>{schoolUid}</pre>
    {/if}
    <ul class="nobullet">
      {#each majorsOfSchool as major}
        <li>
          <CardMajor href="./{major.uid}" {...major}></CardMajor>
        </li>
      {/each}
    </ul>
  </section>
{/each}

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
