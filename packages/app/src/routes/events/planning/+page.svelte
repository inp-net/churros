<script lang="ts">
  import groupBy from 'lodash.groupby';
  import IconChevronDown from '~icons/mdi/chevron-down';
  import type { PageData } from './$types';
  import CalendarDay from '$lib/components/CalendarDay.svelte';
  import { compareAsc, format, isFuture, isToday, parse, parseISO } from 'date-fns';
  import { closestMonday } from '$lib/dates';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import CardEvent from '$lib/components/CardEvent.svelte';
  import { Gif } from 'svelte-tenor';
  import { groupLogoSrc } from '$lib/logos';
  import { isDark } from '$lib/theme';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';

  export let data: PageData;

  let expandedEventId: string | undefined = undefined;

  $: events = data.events?.edges.map((e) => e?.node);

  $: groupedByDate = groupBy(events, (e) => (e?.startsAt ? format(e?.startsAt, 'yyyy-MM-dd') : ''));

  $: groupedByShotgun = groupBy(events, (e) =>
    e.mySoonestShotgunOpensAt ? format(e.mySoonestShotgunOpensAt, 'yyyy-MM-dd') : '',
  );

  $: shownDays = [...new Set([...Object.keys(groupedByDate), ...Object.keys(groupedByShotgun)])]
    .filter((dateString) => {
      if (!dateString) return false;
      const date = parse(dateString, 'yyyy-MM-dd', new Date());
      return isFuture(date) || isToday(date);
    })
    .sort();

  let openedShotgunsList: string | undefined = undefined;

  function handleClickOnShotgunListHeader(day: string, e: Event) {
    if (!(e.target instanceof HTMLElement)) return;
    if (e.target.closest('a, button')) return;

    if (e instanceof MouseEvent || (e instanceof KeyboardEvent && e.key === 'Enter'))
      openedShotgunsList = openedShotgunsList === day ? undefined : day;
  }
</script>

<div class="content">
  <NavigationTabs
    tabs={[
      { name: 'Semaine', href: `../week/${format(closestMonday(new Date()), 'yyyy-MM-dd')}` },
      { name: 'Planning', href: '.' },
    ]}
  />

  <div class="days">
    {#if events.length === 0}
      <div class="empty">
        <Gif
          gif={{
            id: '27616552',
            description: 'John Travolta confused',
            width: 220,
            height: 220,
            gif: 'https://media.tenor.com/EbyOKpncujQAAAAi/john-travolta-tra-jt-transparent.gif',
          }}
        />
        <p>Aucun événement à venir</p>
      </div>
    {/if}
    {#each shownDays as day}
      {@const eventsOfDay = groupedByDate[day]}
      <section class="day">
        <CalendarDay
          showMonth={parseISO(day).getMonth() !== new Date().getMonth()}
          day={parseISO(day)}
        />
        <div class="shotguns-and-events">
          {#if groupedByShotgun[day]?.length > 0}
            {@const shotguns = groupedByShotgun[day]}
            <div class="shotguns" class:open={openedShotgunsList === day}>
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <header
                on:click={(e) => {
                  handleClickOnShotgunListHeader(day, e);
                }}
              >
                <ul class="groups nobullet">
                  {#each new Set(shotguns.map((s) => s.group.uid)) as groupUid}
                    <li>
                      <img
                        class="group-logo"
                        src={groupLogoSrc(
                          $isDark,
                          shotguns.find((s) => s.group.uid === groupUid)?.group ?? {
                            pictureFile: '',
                            pictureFileDark: '',
                          },
                        )}
                        alt={groupUid}
                      />
                    </li>
                  {/each}
                </ul>
                {shotguns.length} shotgun{shotguns.length > 1 ? 's' : ''}
                <ButtonGhost
                  on:click={() => {
                    openedShotgunsList = openedShotgunsList === day ? undefined : day;
                  }}
                >
                  <IconChevronDown></IconChevronDown>
                </ButtonGhost>
              </header>
              <ul class="nobullet shotguns-list">
                {#each shotguns as shotgun}
                  <li>
                    <img
                      class="group-logo"
                      src={groupLogoSrc($isDark, shotgun.group)}
                      alt={shotgun.group.name}
                    />
                    <a href="/events/{shotgun.group.uid}/{shotgun.uid}">{shotgun.title}</a>
                    {#if shotgun.mySoonestShotgunOpensAt}
                      <strong>{format(shotgun.mySoonestShotgunOpensAt, 'HH:mm')}</strong>
                    {/if}
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
          {#if eventsOfDay?.length > 0}
            <ul class="nobullet events-of-day">
              {#each eventsOfDay.sort( (a, b) => compareAsc(a.startsAt, b.startsAt), ) as event (event.id)}
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
          {/if}
        </div>
      </section>
    {/each}
  </div>
</div>

<style>
  .content {
    max-width: 600px;
    padding: 0 0.5rem 4rem;
    margin: 0 auto;
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

  .shotguns-and-events {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .shotguns {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 1rem;
    overflow: hidden;
    border: var(--border-block) solid var(--border);
    border-radius: var(--radius-block);
  }

  .shotguns .group-logo {
    width: 3rem;
    height: 3rem;
    object-fit: cover;
  }

  .shotguns.open ul {
    transition: all 0.25s ease;
  }

  .shotguns.open > ul {
    max-height: 1000000px;
    margin-top: 1rem;
  }

  .shotguns:not(.open) > ul {
    max-height: 0;
    padding: 0;
    margin: 0;
    opacity: 0;
  }

  .shotguns header {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    line-height: 1.1;
  }

  .shotguns header :global(> button) {
    margin-left: auto;
    font-size: 1.5em;
  }

  .shotguns header :global(> button svg) {
    transition: all 0.125s ease;
  }

  .shotguns.open header :global(> button svg) {
    transform: rotate(180deg);
  }

  .shotguns li {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .shotguns li strong {
    display: inline-block;
    margin-left: auto;
  }

  .empty {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    margin-top: 2rem;
    margin-bottom: 4rem;
    text-align: center;
  }

  :global(.gif) {
    width: 50% !important;
    background: none !important;
  }
</style>
