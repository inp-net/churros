<script lang="ts">
  import type { PageData } from './$types';
  import { dayToPath } from './+page';

  export let data: PageData;

  $: previousDay = new Date(data.day.getFullYear(), data.day.getMonth(), data.day.getDate() - 1);
  $: nextDay = new Date(data.day.getFullYear(), data.day.getMonth(), data.day.getDate() + 1);

  const monthFormatter = new Intl.DateTimeFormat('fr', { month: 'long', year: 'numeric' });
  const formatMonth = (date: Date) => monthFormatter.format(date);

  const dayFormatter = new Intl.DateTimeFormat('fr', { dateStyle: 'long' });
  const formatDay = (date: Date) => dayFormatter.format(date).replace(/^1 /, '1er ');
</script>

<h1>{formatDay(data.day)}</h1>

<p class="flex justify-between">
  <a href="../../../{dayToPath(previousDay)}">⬅️ {formatDay(previousDay)}</a>
  <a href="..">⬆️ {formatMonth(data.day)}</a>
  <a href="../../../{dayToPath(nextDay)}">{formatDay(nextDay)} ➡️</a>
</p>
