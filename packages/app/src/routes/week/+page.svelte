<script lang="ts">
  import { PUBLIC_FOY_GROUPS, PUBLIC_STORAGE_URL } from '$env/static/public';
  import IconChevronUp from '~icons/mdi/chevron-up';
  import IconChevronDown from '~icons/mdi/chevron-down';
  import { addDays, startOfWeek, isSameDay } from 'date-fns';
  import type { PageData } from './$types';
  import GhostButton from '$lib/components/buttons/GhostButton.svelte';
  import { me } from '$lib/session';
  import Button from '$lib/components/buttons/Button.svelte';
  import { goto } from '$app/navigation';

  export let data: PageData;
  let { barWeekNow: barWeek, eventsInWeek: events } = data;
  const daysOfWeek = Array(7)
    .fill(0)
    .map((_, i) => addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i));
  let expandedEventUid: string | undefined = undefined;
  const expanded = (event: any, expandedEventUid: string | undefined) =>
    expandedEventUid === event.uid;
  let canChangeBarWeek = Boolean(
    $me?.admin ||
      $me?.groups.some(({ group: { uid } }) => PUBLIC_FOY_GROUPS.split(',').includes(uid))
  );
</script>

<h1>Cette semaine</h1>

<section class="bar-week">
  {#if canChangeBarWeek}
    <Button on:click={() => goto('/bar-weeks')}>Gérer les semaines de bar</Button>
  {/if}
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
        <a href="/club/{group.uid}" class="group">
          <img
            src={group.pictureFile
              ? `${PUBLIC_STORAGE_URL}${group.pictureFile}`
              : 'https://placehold.it/400/400'}
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
      <div class="calendar-day">
        <span class="day-name"
          >{day
            .toLocaleDateString('default', {
              weekday: 'short'
            })
            .replace(/\.$/, '')}</span
        >
        <span class="month-name"
          >{day.toLocaleDateString('default', {
            month: 'long'
          })}</span
        >
        <span class="day-number">
          {day.getDate()}
        </span>
      </div>
      <div class="events-of-day">
        {#each events.filter((e) => isSameDay(e.startsAt, day)) as event}
          <article class="event-of-day" class:expanded={expanded(event, expandedEventUid)}>
            <div
              class="header"
              style:background-image="linear-gradient(#000000aa, #000000aa), url({event.pictureFile
                ? `${PUBLIC_STORAGE_URL}${event.pictureFile}`
                : 'https://picsum.photos/400/400'})"
            >
              <a href="/club/{event.group.uid}/event/{event.uid}">
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
    text-align: center;
  }
  .bar-week {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .bar-week-groups {
    list-style: none;
    display: flex;
    gap: 1rem;

    .group {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

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

    .calendar-day {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 5rem;
      width: 5rem;
      border: var(--border-block) solid black;
      border-radius: var(--radius-block);

      > * {
        margin: -0.25rem;
      }

      .day-name {
        text-transform: uppercase;
      }

      .day-number {
        font-size: 2rem;
        font-weight: bold;
      }
    }

    .events-of-day {
      width: 100%;

      > a {
        text-decoration: none;
      }

      .event-of-day {
        border-radius: var(--radius-block);

        .header {
          background-size: cover;
          padding: 0.5rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
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
