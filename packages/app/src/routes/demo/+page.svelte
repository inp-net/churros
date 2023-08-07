<script lang="ts">
  // PAGE DE TEST A SUPPRIMER
  import CalendarDay from '$lib/components/CalendarDay.svelte';

  let days = 0;

  function incrementDays() {
    days += 1;
  }

  setInterval(incrementDays, 200);

  $: date = new Date(Date.now() + days * 1000 * 60 * 60 * 24);
</script>

<CalendarDay {date} />
