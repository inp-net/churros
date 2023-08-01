<script lang="ts">
  export let date: Date;
  const week = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
  const months = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];
</script>

<div class="date">
  <span class="day-week">{week[date.getDay()]}</span>
  <span class="day-number">{date.getDate()}</span>
  <span class="month">{months[date.getMonth()]}</span>
</div>

<style>
  .date {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .date > span {
    line-height: 1em;
    text-align: center;
  }

  .day-week {
    font-size: 1.5em;
    font-weight: 600;
  }

  .day-number {
    font-size: 3em;
    font-weight: 750;
  }

  .month {
    font-size: 1.5em;
    font-weight: 600;
  }
</style>
