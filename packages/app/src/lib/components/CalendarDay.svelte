<script lang="ts">
  export let day: Date;
  export let showMonth = false;
</script>

<div class="calendar-day">
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
    align-items: center;
    justify-content: center;
    width: 5rem;
    height: 5rem;
    border: var(--border-block) solid black;
    border-radius: var(--radius-block);

    > * {
      line-height: 1;
    }
  }

  .day-name {
    text-transform: uppercase;
  }

  .day-number {
    font-size: 2rem;
    font-weight: bold;
  }
</style>
