<script lang="ts">
  import type { PageData } from './$types';
  import Group from '../../lib/components/TreeGroups.svelte';
  import { createForest } from 'arborist';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import IconPlus from '~icons/mdi/plus';
  import { me } from '$lib/session';
  import { GroupType } from '$lib/zeus';
  import CardGroup from '$lib/components/CardGroup.svelte';

  export let data: PageData;

  const listTrees = createForest(
    data.groups.filter((g) => g.type === GroupType.List),
    { idKey: 'groupId' },
  );
  const studentAssociationSections = createForest(
    data.groups.filter((g) => g.type === GroupType.StudentAssociationSection),
    { idKey: 'groupId' },
  );
  const clubsAssos = createForest(
    data.groups.filter((g) => [GroupType.Association, GroupType.Club].includes(g.type)),
    { idKey: 'groupId' },
  );

  function findNumber(g: { description: string }): number {
    const result = Number.parseFloat(/\b2\d{3}\b/.exec(g.description)?.[0] ?? '0');
    return result;
  }

  const hasMultipleSchools =
    [...new Set(data.groups.map((g) => g.studentAssociation?.school.name ?? ''))].filter(Boolean)
      .length > 1;

  const assertNoUndefineds = <T,>(arr: Array<T | undefined>): T[] => {
    if (arr.includes(undefined)) 
      throw new Error('Undefined found');
    
    return arr as T[];
  };
</script>

<h1>
  Groupes {#if $me?.admin || $me?.canEditGroups}<ButtonSecondary icon={IconPlus} href="./create"
      >Créer</ButtonSecondary
    >{/if}
</h1>

{#if data.studentAssociations}
  <h2>Tes AEs</h2>
  <ul class="nobullet student-associations">
    {#each assertNoUndefineds(data.studentAssociations) as { name, uid, id } (id)}
      <li>
        <CardGroup
          href="/student-associations/{uid}"
          {name}
          pictureFile="//student-asociations/{uid}.png"
          pictureFileDark=""
        ></CardGroup>
      </li>
    {/each}
  </ul>
{/if}

<h2>Les bureaux de tes AEs</h2>
<ul class="nobullet">
  {#each studentAssociationSections as group}
    <li>
      <Group showSchool={hasMultipleSchools} {group} />
    </li>
  {/each}
</ul>

<h2>Clubs et assos</h2>
<ul class="nobullet">
  {#each clubsAssos as group}
    <li>
      <Group showSchool={hasMultipleSchools} {group} />
    </li>
  {/each}
</ul>

<h2>Les listes</h2>
<ul class="nobullet">
  {#each listTrees.sort((a, b) => findNumber(a) - findNumber(b)).reverse() as group}
    <li>
      <Group showSchool={hasMultipleSchools} {group} />
    </li>
  {/each}
</ul>

<style>
  h2 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  ul {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .student-associations {
    flex-flow: row wrap;
    justify-content: center;
  }

  h1 {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    margin-bottom: 3rem;
    text-align: center;
  }
</style>
