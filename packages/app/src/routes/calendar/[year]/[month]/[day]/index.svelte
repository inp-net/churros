<script context="module" lang="ts">
  import type { Load } from './__types';

  export const dayToPath = (date: Date) =>
    `${date.getFullYear()}/` +
    `${`${date.getMonth() + 1}`.padStart(2, '0')}/` +
    `${`${date.getDate()}`.padStart(2, '0')}/`;

  export const load: Load = ({ params, url }) => {
    const day = new Date(
      Number(params.year),
      Number(params.month) - 1,
      Number(params.day),
      0,
      0,
      0,
      0
    );
    const path = dayToPath(day);
    if (!url.pathname.endsWith(path)) return { status: 307, redirect: `../../../${path}` };
    return { props: { day } };
  };
</script>

<script lang="ts">
  export let day: Date;

  $: previousDay = new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1, 0, 0, 0, 0);
  $: nextDay = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1, 0, 0, 0, 0);

  const monthFormatter = new Intl.DateTimeFormat('fr', { month: 'long', year: 'numeric' });
  const formatMonth = (date: Date) => monthFormatter.format(date);

  const dayFormatter = new Intl.DateTimeFormat('fr', { dateStyle: 'long' });
  const formatDay = (date: Date) => dayFormatter.format(date).replace(/^1 /, '1er ');
</script>

<h1>{formatDay(day)}</h1>

<p class="flex justify-between">
  <a href="../../../{dayToPath(previousDay)}">⬅️ {formatDay(previousDay)}</a>
  <a href="..">⬆️ {formatMonth(day)}</a>
  <a href="../../../{dayToPath(nextDay)}">{formatDay(nextDay)} ➡️</a>
</p>
