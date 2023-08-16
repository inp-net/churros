<script lang="ts">
  import { isSameDay } from 'date-fns';

  export let day: Date;
  export let showMonth = false;
</script>

<div class="calendar-day" class:today={isSameDay(day, new Date())}>
  <span class="day-name"
    >{day
      .toLocaleDateString('default', {
        weekday: 'short',
      })
      .replace(/\.$/, '')}</span
  >
  <span class="day-number">
    {day.getDate()}
  </span>
  {#if showMonth}
    <span class="month-name"
      >{day.toLocaleDateString('default', {
        month: 'short',
      })}</span
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
    border: var(--border-block) solid var(--border);
    border-radius: var(--radius-block);

    > * {
      line-height: 1;
    }
  }

  .calendar-day.today {
    border-color: var(--primary-border);

    --text: var(--primary-border);
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
