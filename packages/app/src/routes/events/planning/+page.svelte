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
  <NavigationTabs
    tabs={[
      { name: 'Semaine', href: `../week/${format(closestMonday(new Date()), 'yyyy-MM-dd')}` },
      { name: 'Planning', href: '.' },
    ]}
  />

  <div class="days">
    {#each Object.keys(groupedByDate)
      .filter((day) => groupedByDate[day]?.length > 0)
      .sort() as day}
      {@const eventsOfDay = groupedByDate[day]}
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
  <section class="add-to-calendar">
    <ButtonSecondary href="../feed" icon={IconCalendarPlus}
      >Ajouter à mon calendrier</ButtonSecondary
    >
  </section>
</div>

<style>
  .content {
    padding: 0 0.5rem 4rem;
  }

  .days {
    display: flex;
    flex-direction: column;
    row-gap: 3rem;
    width: fit-content;
    min-width: calc(min(100%, 600px));
    max-width: 600px;
    margin: 0 auto;
  }

  section.day {
    display: flex;
    column-gap: 1rem;
  }

  .events-of-day {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 1rem;
  }

  .add-to-calendar {
    display: flex;
    justify-content: center;
    margin-top: 4rem;
  }
</style>
