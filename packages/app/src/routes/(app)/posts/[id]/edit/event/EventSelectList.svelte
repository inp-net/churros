<script lang="ts">
  import type { PagePostEditLinkedEvent_Event$data } from '$houdini';
  import { loading, mapAllLoading, type DeepMaybeLoading } from '$lib/loading';
  import { nanoid } from 'nanoid';
  import EventSelectItem from './EventSelectItem.svelte';

  export let current: DeepMaybeLoading<PagePostEditLinkedEvent_Event$data> | null;
  export let events: Array<DeepMaybeLoading<PagePostEditLinkedEvent_Event$data>>;
</script>

<fieldset>
  {#if current && !events.some((e) => loading(e.id, '') === loading(current.id, null))}
    <EventSelectItem selected on:select event={current} />
  {/if}

  {#each events as event (loading(event.id, nanoid()))}
    <EventSelectItem
      selected={mapAllLoading([event.id, current?.id], (thisOne, current) => thisOne === current)}
      on:select
      {event}
    />
  {/each}
</fieldset>

<style>
  fieldset {
    display: flex;
    flex-direction: column;
    gap: 2rem 0;
    border: none;
  }
</style>
