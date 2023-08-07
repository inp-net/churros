<script lang="ts">
  import type { PageData } from './$types';
  import Group from '../../lib/components/TreeGroups.svelte';
  import { createForest } from 'arborist';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import IconPlus from '~icons/mdi/plus';
  import { me } from '$lib/session';
  import { GroupType } from '$lib/zeus';

  export let data: PageData;

  const listTrees = createForest(
    data.groups.filter((g) => g.type === GroupType.List),
    { idKey: 'groupId' }
  );
  const studentAssociationSections = createForest(
    data.groups.filter((g) => g.type === GroupType.StudentAssociationSection),
    { idKey: 'groupId' }
  );
  const clubsAssos = createForest(
    data.groups.filter((g) => [GroupType.Association, GroupType.Club].includes(g.type)),
    { idKey: 'groupId' }
  );

  function findNumber(g: { description: string }): number {
    const result = Number.parseFloat(/\b2\d{3}\b/.exec(g.description)?.[0] ?? '0');
    console.log(`${g.description} ${result}`);
    return result;
  }
</script>

<h1>
  Groupes {#if $me?.admin || $me?.canEditGroups}<ButtonSecondary
      icon={IconPlus}
      href="/clubs/create">Créer</ButtonSecondary
    >{/if}
</h1>

<h2>L'AE</h2>
<ul class="nobullet">
  {#each studentAssociationSections as group}
    <li>
      <Group {group} />
    </li>
  {/each}
</ul>

<h2>Clubs et assos</h2>
<ul class="nobullet">
  {#each clubsAssos as group}
    <li>
      <Group {group} />
    </li>
  {/each}
</ul>

<h2>Les listes</h2>
<ul class="nobullet">
  {#each listTrees.sort((a, b) => findNumber(a) - findNumber(b)).reverse() as group}
    <li>
      <Group {group} />
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

  h1 {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    margin-bottom: 3rem;
    text-align: center;
  }
</style>
