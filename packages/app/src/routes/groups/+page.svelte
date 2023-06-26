<script lang="ts">
  import type { PageData } from './$types';
  import Group from '../../lib/components/TreeGroups.svelte';
  import { createForest } from 'arborist';

  export let data: PageData;

  const trees = createForest(data.groups, { idKey: 'groupId' });
</script>

<ul>
  {#each trees as group}
    <li>
      <Group {group} />
    </li>
  {/each}
</ul>
