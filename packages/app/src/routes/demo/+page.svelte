<script lang="ts">
  // PAGE DE TEST A SUPPRIMER
  import CalendarDay from '$lib/components/CalendarDay.svelte';

  let days = 0;

  function incrementDays() {
    days += 1;
    console.log(`Days: ${days}`);
  }

  setInterval(incrementDays, 200); // 1000 ms = 1 seconde

  $: date = new Date(days * 1000 * 60 * 60 * 24);
</script>

<CalendarDay {date} />
