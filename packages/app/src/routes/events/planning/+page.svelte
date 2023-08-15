<script lang="ts">
  import { groupBy } from 'lodash';
  import type { PageData } from './$types';
  import IconCalendarPlus from '~icons/mdi/calendar-plus';
  import CalendarDay from '$lib/components/CalendarDay.svelte';
  import { compareAsc, format, parseISO } from 'date-fns';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { closestMonday } from '$lib/dates';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import CardEvent from '$lib/components/CardEvent.svelte';

  export let data: PageData;

  let expandedEventId: string | undefined = undefined;

  $: events = data.events?.edges.map((e) => e?.node);

  $: groupedByDate = groupBy(events, (e) => (e?.startsAt ? format(e?.startsAt, 'yyyy-MM-dd') : ''));
</script>

<div class="content">
  <section class="add-to-calendar">
    <ButtonSecondary href="../feed" icon={IconCalendarPlus}>Ajouter au calendrier</ButtonSecondary>
  </section>
  <NavigationTabs
    tabs={[
      { name: 'Semaine', href: `../week/${format(closestMonday(new Date()), 'yyyy-MM-dd')}` },
      { name: 'Planning', href: '.' },
    ]}
  />

  {#each Object.entries(groupedByDate).filter(([_day, events]) => events.length > 0) as [day, eventsOfDay] (day)}
    <section class="day">
      <CalendarDay
        showMonth={parseISO(day).getMonth() !== new Date().getMonth()}
        day={parseISO(day)}
      />
      <ul class="nobullet events-of-day">
        {#each eventsOfDay.sort((a, b) => compareAsc(a.startsAt, b.startsAt)) as event (event.id)}
          <li>
            <CardEvent
              bind:expandedEventId
              collapsible
              href="/events/{event.group.uid}/{event.uid}"
              {...event}
            />
          </li>
        {/each}
      </ul>
    </section>
  {/each}
</div>

<style>
  .content {
    padding: 0 0.5rem 4rem;
  }

  section.day {
    display: flex;
    column-gap: 1rem;
    width: fit-content;
    min-width: calc(min(100%, 600px));
    max-width: 600px;
    margin: 0 auto;
  }

  .events-of-day {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .add-to-calendar {
    display: flex;
    justify-content: center;
    margin: 0.5rem 0;
  }
</style>
