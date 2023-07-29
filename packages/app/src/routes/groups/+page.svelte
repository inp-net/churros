<script lang="ts">
  import type { PageData } from './$types';
  import Group from '../../lib/components/TreeGroups.svelte';
  import { createForest } from 'arborist';

  export let data: PageData;

  const trees = createForest(data.groups, { idKey: 'groupId' });
</script>

<h1>Groupes</h1>

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
    margin-bottom: 3rem;
    text-align: center;
  }
</style>
