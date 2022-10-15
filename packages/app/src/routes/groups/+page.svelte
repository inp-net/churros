<script lang="ts">
  import type { PageData } from './$types';
  import Group from './Group.svelte';
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
