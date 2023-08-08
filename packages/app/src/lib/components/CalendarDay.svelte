<script lang="ts">
  import { format, startOfYear, addMonths } from 'date-fns';
  import fr from 'date-fns/locale/fr/index.js';
  export let date: Date;

  // Génération jours de la semaine
  const daysOfWeek = Array.from({ length: 7 }, (_, index) => {
    // Le dimanche le plus proche du jour où je code ça (dimanche = premier jour de la semaine)
    const currentDate = new Date('July 30, 2023');
    currentDate.setDate(currentDate.getDate() + index);
    return format(currentDate, 'iii', { locale: fr }).toUpperCase().slice(0, -1); // Il y a un . à enlever à la fin
  });

  // Génération mois
  const months: string[] = Array.from({ length: 12 }, (_, i) => {
    const monthDate = addMonths(startOfYear(new Date()), i);
    const month = format(monthDate, 'MMM', { locale: fr });
    return month.charAt(0).toUpperCase() + month.slice(1); // Première lettre en maj
  });
</script>

<div class="date">
  <span class="day-week">{daysOfWeek[date.getDay()]}</span>
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
