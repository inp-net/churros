<script lang="ts">
  import type { PageData } from './$types';
  import Group from '../../lib/components/TreeGroups.svelte';
  import { createForest } from 'arborist';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import IconPlus from '~icons/mdi/plus';
  import { me } from '$lib/session';

  export let data: PageData;

  const trees = createForest(data.groups, { idKey: 'groupId' });
</script>

<h1>
  Groupes {#if $me?.admin || $me?.canEditGroups}<ButtonSecondary
      icon={IconPlus}
      href="/clubs/create">Créer</ButtonSecondary
    >{/if}
</h1>

<ul class="nobullet">
  {#each trees as group}
    <li>
      <Group {group} />
    </li>
  {/each}
</ul>

<style>
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
