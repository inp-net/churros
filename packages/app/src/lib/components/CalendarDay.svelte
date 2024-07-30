<script lang="ts">
  import { mapLoading, onceLoaded, type MaybeLoading } from '$lib/loading';
  import LoadingText from './LoadingText.svelte';
  import { isToday } from 'date-fns';

  export let day: MaybeLoading<Date>;
  export let showMonth = false;
</script>

<div class="calendar-day" class:today={onceLoaded(day, isToday, false)}>
  <span class="day-name">
    <LoadingText
      value={mapLoading(day, (day) =>
        day
          .toLocaleDateString('default', {
            weekday: 'short',
          })
          .replace(/\.$/, ''),
      )}>{new Date().toLocaleDateString('default', { weekday: 'short' })}</LoadingText
    >
  </span>
  <span class="day-number">
    <LoadingText value={mapLoading(day, (day) => day.getDate())}>13</LoadingText>
  </span>
  {#if showMonth}
    <span class="month-name"
      ><LoadingText
        value={mapLoading(day, (day) =>
          day.toLocaleDateString('default', {
            month: 'short',
          }),
        )}>{new Date().toLocaleDateString('default', { month: 'short' })}</LoadingText
      ></span
    >
  {/if}
</div>

<style lang="scss">
  .calendar-day {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 4rem;
    height: 4rem;
    color: var(--text);
    border: var(--border-block) solid;
    border-radius: var(--radius-block);

    > * {
      line-height: 1;
    }
  }

  .calendar-day.today {
    border-color: var(--primary);

    --text: var(--primary);
  }

  .day-name {
    font-size: 0.8em;
    text-transform: uppercase;
  }

  .day-number {
    font-size: 1.5rem;
    font-weight: bold;
  }
</style>
