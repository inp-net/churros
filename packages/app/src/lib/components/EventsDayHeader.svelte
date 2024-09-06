<script lang="ts">
  import { formatDateRelativeSmart } from '$lib/dates';
  import { onceLoaded, type MaybeLoading } from '$lib/loading';
  import { format, isToday } from 'date-fns';
  import IconEvent from '~icons/msl/event-outline';
  import IconShotgun from '~icons/msl/lock-open-outline';
  import LoadingText from './LoadingText.svelte';

  export let day: MaybeLoading<Date>;
  export let shotgunsCount: MaybeLoading<number>;
  export let eventsCount: MaybeLoading<number>;
</script>

<header class:primary={onceLoaded(day, isToday, false)}>
  <div class="day">
    <div class="calendar">
      <div class="weekday">{onceLoaded(day, (d) => format(d, 'E'), '')}</div>
      <div class="number">{onceLoaded(day, (d) => format(d, 'd'), '')}</div>
    </div>
    <div class="relative">{onceLoaded(day, formatDateRelativeSmart, '')}</div>
  </div>
  <div class="counts">
    {#if shotgunsCount !== 0}
      <div class="count">
        <IconShotgun />
        <LoadingText value={shotgunsCount}>3</LoadingText>
      </div>
    {/if}
    {#if eventsCount !== 0}
      <div class="count">
        <IconEvent />
        <LoadingText value={eventsCount}>3</LoadingText>
      </div>
    {/if}
  </div>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.25em 1em;
    background-color: var(--bg2);
  }

  header.primary {
    background-color: var(--bg);
  }

  .day,
  .counts {
    display: flex;
    column-gap: 0.5em;
    align-items: center;
  }

  .count {
    display: flex;
    column-gap: 0.1em;
    align-items: center;
  }

  .calendar {
    display: grid;
    grid-template-rows: 30% 70%;
    align-items: center;
    width: 2.5rem;
    height: 2.5rem;
    text-align: center;
    border: var(--border-block) solid;
    scale: 0.75;
  }

  .calendar .weekday {
    font-size: 0.6rem;
    font-weight: bold;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.25ch;
    border-bottom: var(--border-block) solid;
  }

  .calendar .number {
    font-size: 1.2rem;
    line-height: 1;
  }
</style>
