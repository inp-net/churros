<script lang="ts">
  import CalendarDay from '../../../../lib/components/CalendarDay.svelte';
  import IconEdit from '~icons/mdi/pencil';
  import { PUBLIC_FOY_GROUPS, PUBLIC_STORAGE_URL } from '$env/static/public';
  import IconCalendarPlus from '~icons/mdi/calendar-plus';
  import IconPlanningView from '~icons/mdi/calendar-multiselect-outline';
  import IconChevronUp from '~icons/mdi/chevron-up';
  import IconChevronDown from '~icons/mdi/chevron-down';
  import IconBackward from '~icons/mdi/chevron-left';
  import IconForward from '~icons/mdi/chevron-right';
  import {
    addDays,
    startOfWeek,
    isSameDay,
    differenceInWeeks,
    previousMonday,
    nextMonday,
    formatISO,
  } from 'date-fns';
  import type { PageData } from './$types';
  import { me } from '$lib/session';
  import { dateFormatter } from '$lib/dates';
  import GhostButton from '$lib/components/ButtonGhost.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';

  $: pageTitle = computePageTitle(data.shownWeek);

  function computePageTitle(shownWeek: Date): string {
    switch (
      differenceInWeeks(
        startOfWeek(shownWeek, { weekStartsOn: 1 }),
        startOfWeek(new Date(), { weekStartsOn: 1 })
      )
    ) {
      case 0: {
        return 'Cette semaine';
      }

      case 1: {
        return 'La semaine prochaine';
      }

      case -1: {
        return 'La semaine dernière';
      }

      case 2: {
        return 'Dans deux semaines';
      }

      case -2: {
        return 'Il y a deux semaines';
      }

      default: {
        return `Semaine du ${dateFormatter.format(startOfWeek(shownWeek, { weekStartsOn: 1 }))}`;
      }
    }
  }

  export let data: PageData;

  let barWeek: typeof data.barWeekNow;
  let events: typeof data.eventsInWeek;
  $: ({ barWeekNow: barWeek, eventsInWeek: events } = data);

  let daysOfWeek: Date[] = [];
  $: daysOfWeek = Array.from({ length: 7 })
    .fill(0)
    .map((_, i) => addDays(startOfWeek(data.shownWeek, { weekStartsOn: 1 }), i));

  let expandedEventUid: string | undefined = undefined;
  const expanded = (event: { uid: string }, expandedEventUid: string | undefined) =>
    expandedEventUid === event.uid;

  const canChangeBarWeek = Boolean(
    $me?.admin ||
      $me?.groups.some(({ group: { uid } }) => PUBLIC_FOY_GROUPS.split(',').includes(uid))
  );
</script>

<h1>
  {pageTitle}
</h1>
<div class="navigation">
  <ButtonGhost
    href="/events/week/{formatISO(previousMonday(data.shownWeek), { representation: 'date' })}"
    ><IconBackward /></ButtonGhost
  >
  <div class="buttons">
    {#if canChangeBarWeek}
      <ButtonSecondary icon={IconEdit} href="/bar-weeks">Semaines de bar</ButtonSecondary>
    {/if}
    <ButtonSecondary icon={IconPlanningView} href="../../planning">Planning</ButtonSecondary>
    <ButtonSecondary icon={IconCalendarPlus} href="../../feed"
      >Ajouter au calendrier</ButtonSecondary
    >
  </div>
  <ButtonGhost
    href="/events/week/{formatISO(nextMonday(data.shownWeek), { representation: 'date' })}"
    ><IconForward /></ButtonGhost
  >
</div>

<section class="bar-week">
  {#if barWeek.groups.length > 0}
    <div class="description">
      {#if barWeek.descriptionHtml}
        {@html barWeek.descriptionHtml}
      {:else}
        <p>Semaine de bar proposée par:</p>
      {/if}
    </div>
    <ul class="bar-week-groups">
      {#each barWeek.groups as group}
        <a href="/groups/{group.uid}" class="group">
          <img
            src={group.pictureFile
              ? // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `${PUBLIC_STORAGE_URL}${group.pictureFile}`
              : 'https://via.placeholder.com/400/400'}
            alt=""
          />
          <span class="name">{group.name}</span>
        </a>
      {/each}
    </ul>
  {/if}
</section>

<div class="days">
  {#each daysOfWeek as day}
    <section class="day">
      <CalendarDay showMonth={[...new Set(daysOfWeek.map((d) => d.getMonth()))].length > 1} {day} />
      <div class="events-of-day">
        {#each events.filter((e) => isSameDay(e.startsAt, day)) as event}
          <article class="event-of-day" class:expanded={expanded(event, expandedEventUid)}>
            <div
              class="header"
              style:background-image="linear-gradient(#000000aa, #000000aa), url({event.pictureFile
                ? // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                  `${PUBLIC_STORAGE_URL}${event.pictureFile}`
                : 'https://picsum.photos/400/400'})"
            >
              <a href="/events/{event.group.uid}/{event.uid}">
                <h2>{event.title}</h2>
              </a>
              <GhostButton
                darkShadow
                on:click={() => {
                  expandedEventUid = expanded(event, expandedEventUid) ? undefined : event.uid;
                }}
              >
                {#if expanded(event, expandedEventUid)}
                  <IconChevronUp color="white" />
                {:else}
                  <IconChevronDown color="white" />
                {/if}
              </GhostButton>
            </div>
            <div class="description">
              {@html event.descriptionHtml}
            </div>
          </article>
        {/each}
      </div>
    </section>
  {/each}
</div>

<style lang="scss">
  h1 {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
  }

  .navigation {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-around;
    margin-bottom: 2rem;
    font-size: 1.5em;
  }

  .manage {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: -1.5rem;
    margin-bottom: 1rem;
  }

  .bar-week {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 1rem;
  }

  .bar-week-groups {
    display: flex;
    gap: 1rem;
    list-style: none;

    .group {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      img {
        width: 5rem;
      }
    }
  }

  .days {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .day {
    display: flex;
    gap: 1rem;

    .events-of-day {
      width: 100%;

      .event-of-day {
        border-radius: var(--radius-block);

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 1.5rem;
          background-size: cover;
        }

        .header * {
          color: white;
        }

        .header a {
          display: inline-block;
        }

        .description {
          overflow: hidden;
        }

        &:not(.expanded) .description {
          height: 0;
        }
      }
    }
  }
</style>
