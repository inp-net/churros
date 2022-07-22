<script context="module" lang="ts">
  import type { Load } from './__types';

  export const monthToPath = (date: Date) =>
    `${date.getFullYear()}/${`${date.getMonth() + 1}`.padStart(2, '0')}/`;

  export const load: Load = ({ params, url }) => {
    const firstDay = new Date(Number(params.year), Number(params.month) - 1, 1, 0, 0, 0, 0);
    const path = monthToPath(firstDay);
    if (!url.pathname.endsWith(path)) return { status: 307, redirect: `../../${path}` };
    return { props: { firstDay } };
  };
</script>

<script lang="ts">
  export let firstDay: Date;

  $: previousMonth = new Date(firstDay.getFullYear(), firstDay.getMonth() - 1, 1, 0, 0, 0, 0);
  $: nextMonth = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 1, 0, 0, 0, 0);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const formatter = new Intl.DateTimeFormat('fr', { month: 'long', year: 'numeric' });
  const format = (date: Date) => formatter.format(date);

  /** Maps Mondays to 0 and Sundays to 6. */
  const wrapWeek = (dayOfWeek: number) => (dayOfWeek + 6) % 7;

  let grid: Array<Array<Date | undefined>> = [];

  $: {
    // Add empty cells to pad
    let lastRow: Array<Date | undefined> = Array.from({ length: wrapWeek(firstDay.getDay()) });
    grid = [lastRow];

    let i = 1;
    let day = new Date(firstDay.getFullYear(), firstDay.getMonth(), i, 0, 0, 0, 0);
    while (day.getMonth() === firstDay.getMonth()) {
      if (wrapWeek(day.getDay()) === 0) {
        lastRow = [day];
        grid = [...grid, lastRow];
      } else {
        lastRow.push(day);
      }

      i++;
      day = new Date(firstDay.getFullYear(), firstDay.getMonth(), i, 0, 0, 0, 0);
    }

    // Add empty cells to pad
    lastRow.push(...Array.from<undefined>({ length: 7 - lastRow.length }));
  }
</script>

<h1>{format(firstDay)}</h1>

<p class="flex justify-between">
  <a href="../../{monthToPath(previousMonth)}">⬅️ {format(previousMonth)}</a>
  <a href="../../{monthToPath(nextMonth)}">{format(nextMonth)} ➡️</a>
</p>

<table>
  <tr><th>Lu</th><th>Ma</th><th>Me</th><th>Je</th><th>Ve</th><th>Sa</th><th>Di</th></tr>
  {#each grid as row}
    <tr>
      {#each row as day}
        <td aria-selected={day?.getTime() === today.getTime()}>
          {#if day}<a href="{day.getDate()}/">{day.getDate()}</a>{/if}
        </td>
      {/each}
    </tr>
  {/each}
</table>

<style lang="scss">
  table {
    width: 100%;
    font-variant-numeric: tabular-nums;
    table-layout: fixed;
    border-collapse: collapse;
  }

  tr {
    border: none;
  }

  td {
    position: relative;
    padding: 1em;
    text-align: center;
    border: 1px solid silver;

    a::before {
      position: absolute;
      inset: 0;
      content: '';
    }
  }

  td[aria-selected='true'] {
    background-color: #fcd34d;
  }

  td:hover {
    background-color: #dfe;
  }
</style>
