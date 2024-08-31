<script lang="ts">
  import { PendingValue } from '$houdini';
  import CardEvent from '$lib/components/CardEvent.svelte';
  import EventsDayHeader from '$lib/components/EventsDayHeader.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { allLoaded } from '$lib/loading';
  import { isMobile } from '$lib/mobile';
  import { infinitescroll } from '$lib/scroll';
  import type { PageData } from './$houdini';

  const mobile = isMobile();

  export let data: PageData;
  $: ({ PageEventsList } = data);
</script>

<main use:infinitescroll={() => PageEventsList.loadNextPage()}>
  <MaybeError result={$PageEventsList} let:data>
    {#each data.eventsByDay.edges as { node: { date, happening, shotgunning } }}
      <EventsDayHeader
        day={date}
        eventsCount={allLoaded(happening) ? happening.length : PendingValue}
        shotgunsCount={allLoaded(shotgunning) ? shotgunning.length : PendingValue}
      />
      <ul class="nobullet events" class:mobile>
        {#each shotgunning as event}
          <li>
            <CardEvent {event} shotgun />
          </li>
        {/each}
        {#each happening as event}
          <li>
            <CardEvent {event} />
          </li>
        {/each}
      </ul>
    {/each}
    <div class="scroll-end">
      {#if $PageEventsList.pageInfo.hasNextPage}
        <CardEvent event={null} />
      {:else}
        <p class="no-more">Plus d'évènements à afficher!</p>
      {/if}
    </div>
  </MaybeError>
</main>

<style>
  ul.events {
    display: flex;
    flex-direction: column;
    margin-bottom: 2rem;
  }

  ul.events:not(.mobile) {
    row-gap: 2rem;
  }
</style>
