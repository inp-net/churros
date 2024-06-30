<script lang="ts">
  import ListEventsByDay from '$lib/components/ListEventsByDay.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageEventsWeek } = data);


  let expandedEventId: string | undefined = undefined;
  let openedShotgunsList: Date | undefined = undefined;
</script>

<MaybeError result={$PageEventsWeek} let:data>
  <ListEventsByDay bind:expandedEventId bind:openedShotgunsList events={data} />
</MaybeError>
