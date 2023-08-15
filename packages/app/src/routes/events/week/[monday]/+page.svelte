<script lang="ts">
  import CalendarDay from '../../../../lib/components/CalendarDay.svelte';
  import { PUBLIC_FOY_GROUPS, PUBLIC_STORAGE_URL } from '$env/static/public';
  import IconBackward from '~icons/mdi/chevron-left';
  import IconGear from '~icons/mdi/cog-outline';
  import IconForward from '~icons/mdi/chevron-right';
  import IconCalendarPlus from '~icons/mdi/calendar-plus';
  import { addDays, startOfWeek, isSameDay, previousMonday, nextMonday, formatISO } from 'date-fns';
  import type { PageData } from './$types';
  import { me } from '$lib/session';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { isDark } from '$lib/theme';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import CardEvent from '$lib/components/CardEvent.svelte';

  export let data: PageData;

  let barWeek: typeof data.barWeekNow;
  let events: typeof data.eventsInWeek;
  $: ({ barWeekNow: barWeek, eventsInWeek: events } = data);

  let daysOfWeek: Date[] = [];
  $: daysOfWeek = Array.from({ length: 7 })
    .fill(0)
    .map((_, i) => addDays(startOfWeek(data.shownWeek, { weekStartsOn: 1 }), i));

  let expandedEventId: string | undefined = undefined;

  const canChangeBarWeek = Boolean(
    $me?.admin ||
      $me?.groups.some(({ group: { uid } }) => PUBLIC_FOY_GROUPS.split(',').includes(uid))
  );
</script>

<div class="content">
  <section class="add-to-calendar">
    <ButtonSecondary href="../feed" icon={IconCalendarPlus}>Ajouter au calendrier</ButtonSecondary>
  </section>
  <NavigationTabs
    tabs={[
      { name: 'Semaine', href: '.' },
      { name: 'Planning', href: '../../planning/' },
    ]}
  />
  <div class="navigation">
    <a href="/events/week/{formatISO(previousMonday(data.shownWeek), { representation: 'date' })}"
      ><IconBackward /> Précédente</a
    >
    <a href="/events/week/{formatISO(nextMonday(data.shownWeek), { representation: 'date' })}">
      Suivante <IconForward />
    </a>
  </div>

  {#if barWeek.groups.length > 0}
    <section class="bar-week">
      <div class="description">
        <p>Semaine de bar de</p>
      </div>
      <ul class="bar-week-groups">
        {#each barWeek.groups as group}
          <li class="group">
            <a href="/groups/{group.uid}"
              ><img
                src="{PUBLIC_STORAGE_URL}{$isDark ? group.pictureFileDark : group.pictureFile}"
                alt=""
              />
              {group.name}</a
            >
          </li>
        {/each}
      </ul>
      {#if canChangeBarWeek}
        <ButtonSecondary href="/bar-weeks/" icon={IconGear}>Gérer</ButtonSecondary>
      {/if}
    </section>
  {/if}

  <div class="days">
    {#each daysOfWeek as day}
      <section class="day">
        <CalendarDay
          showMonth={[...new Set(daysOfWeek.map((d) => d.getMonth()))].length > 1}
          {day}
        />
        <div class="events-of-day">
          {#each events.filter((e) => isSameDay(e.startsAt, day)) as event}
            <CardEvent
              collapsible
              bind:expandedEventId
              href="/events/{event.group.uid}/{event.uid}"
              {...event}
            />
          {/each}
        </div>
      </section>
    {/each}
  </div>
</div>

<style lang="scss">
  .content {
    padding: 0 0.5rem 4rem;
    max-width: 600px;
    margin: 0 auto;
  }
  .add-to-calendar {
    display: flex;
    justify-content: center;
    margin: 0.5rem 0;
  }

  .navigation {
    position: fixed;
    right: 0;

    z-index: 10;
    bottom: 2rem;
    left: 0;
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-around;
    padding: 1rem 0;
    margin-bottom: 2rem;
    color: var(--text);
    background: var(--bg);
  }
  .bar-week {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    margin-top: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .bar-week-groups {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    list-style: none;

    a {
      display: flex;
      gap: 0.5rem;
      align-items: center;

      img {
        width: 3rem;
        height: 3rem;
        color: var(--muted-text);
        background: var(--muted-bg);
        border-radius: var(--radius-block);
        object-fit: contain;
      }
    }
  }

  .days {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: fit-content;
    min-width: calc(min(100%, 600px));
    margin: 0 auto;
  }

  .day {
    display: flex;
    gap: 1rem;
    width: fit-content;

    .events-of-day {
      display: flex;
      flex-flow: column wrap;
      gap: 2rem;
    }
  }
</style>
