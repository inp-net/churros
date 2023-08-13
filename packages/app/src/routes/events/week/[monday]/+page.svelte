<script lang="ts">
  import CalendarDay from '../../../../lib/components/CalendarDay.svelte';
  import { PUBLIC_FOY_GROUPS, PUBLIC_STORAGE_URL } from '$env/static/public';
  import IconChevronUp from '~icons/mdi/chevron-up';
  import IconChevronDown from '~icons/mdi/chevron-down';
  import IconBackward from '~icons/mdi/chevron-left';
  import IconGear from '~icons/mdi/cog-outline';
  import IconForward from '~icons/mdi/chevron-right';
  import { addDays, startOfWeek, isSameDay, previousMonday, nextMonday, formatISO } from 'date-fns';
  import type { PageData } from './$types';
  import { me } from '$lib/session';
  import GhostButton from '$lib/components/ButtonGhost.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { isDark } from '$lib/theme';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';

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

<div class="content">
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

  <section class="bar-week">
    {#if barWeek.groups.length > 0}
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
    {/if}
  </section>

  <div class="days">
    {#each daysOfWeek as day}
      <section class="day">
        <CalendarDay
          showMonth={[...new Set(daysOfWeek.map((d) => d.getMonth()))].length > 1}
          {day}
        />
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

  .content {
    padding-bottom: 4rem;
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
  }

  .navigation {
    position: fixed;
    right: 0;

    // font-size: 1.5em;
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
