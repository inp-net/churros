<script lang="ts">
  import { groupBy } from 'lodash';
  import type { PageData } from './$types';
  import IconCalendarPlus from '~icons/mdi/calendar-plus';
  import CalendarDay from '$lib/components/CalendarDay.svelte';
  import IconWeekView from '~icons/mdi/calendar-week-outline';
  import { format, parseISO } from 'date-fns';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { closestMonday } from '$lib/dates';

  export let data: PageData;

  $: events = data.events?.edges.map((e) => e?.node);

  $: groupedByDate = groupBy(events, (e) => e?.startsAt.toISOString());
</script>

<h1>Évènements</h1>
<div class="navigation">
  <ButtonSecondary
    icon={IconWeekView}
    href="../week/{format(closestMonday(new Date()), 'yyyy-MM-dd')}">Par semaine</ButtonSecondary
  >
  <ButtonSecondary newTab icon={IconCalendarPlus} href="../feed"
    >Ajouter au calendrier</ButtonSecondary
  >
</div>

{#each Object.entries(groupedByDate).filter(([_day, events]) => events.length > 0) as [day, eventsOfDay] (day)}
  <section class="day">
    <CalendarDay showMonth day={parseISO(day)} />
    <ul class="nobullet">
      {#each eventsOfDay as event (event.id)}
        <li>
          <a href="../{event.group.uid}/{event.uid}">
            {event.title}
          </a>
        </li>
      {/each}
    </ul>
  </section>
{/each}

<style>
  section.day {
    display: flex;
    column-gap: 2rem;
    max-width: 1000px;
    margin: 0 auto;
  }

  h1 {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0;
  }

  .navigation {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.5rem;
    align-items: center;
    justify-content: center;
    margin-top: 0.5rem;
    margin-bottom: 2rem;
  }
</style>
