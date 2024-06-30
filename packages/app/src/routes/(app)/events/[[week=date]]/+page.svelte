<script lang="ts">
  import { page } from '$app/stores';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import CalendarDay from '$lib/components/CalendarDay.svelte';
  import CardEvent from '$lib/components/CardEvent.houdini.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { allLoaded, loaded, loading, mapLoading, onceAllLoaded } from '$lib/loading';
  import { groupLogoSrc } from '$lib/logos';
  import { infinitescroll } from '$lib/scroll';
  import { isDark } from '$lib/theme';
  import { notNull } from '$lib/typing';
  import { format, parseISO } from 'date-fns';
  import { Gif } from 'svelte-tenor';
  import IconChevronDown from '~icons/mdi/chevron-down';
  import IconBackward from '~icons/mdi/chevron-left';
  import IconForward from '~icons/mdi/chevron-right';
  import type { PageData } from './$houdini';
  import { _weekArg as weekArg } from './+page';

  export let data: PageData;
  $: ({ PageEventsList } = data);

  $: currentWeek = $page.params.week ? parseISO($page.params.week) : undefined;
  let expandedEventId: string | undefined = undefined;
  let openedShotgunsList: Date | undefined = undefined;

  function handleClickOnShotgunListHeader(day: Date, e: Event) {
    if (!(e.target instanceof HTMLElement)) return;
    if (e.target.closest('a, button')) return;

    if (e instanceof MouseEvent || (e instanceof KeyboardEvent && e.key === 'Enter'))
      openedShotgunsList = openedShotgunsList === day ? undefined : day;
  }
</script>

<div class="content">
  <NavigationTabs
    data-sveltekit-preload-data="tap"
    tabs={[
      {
        name: 'Semaine',
        href: $page.params.week ? '.' : `/events/${weekArg(new Date(), 0)}`,
      },
      { name: 'Planning', href: $page.params.week ? '/events' : '.' },
      { name: 'Mes places', href: '/bookings' },
    ]}
  />
  {#if currentWeek}
    <div data-sveltekit-preload-data="tap" class="navigation">
      <a href="/events/{weekArg(currentWeek, -7)}"> <IconBackward /> Précédente </a>
      <a href="/events/{weekArg(new Date(), 0)}"> Aujourd'hui</a>
      <a href="/events/{weekArg(currentWeek, 7)}"> Suivante <IconForward /> </a>
    </div>
  {/if}
  <MaybeError result={$PageEventsList} let:data={{ eventsByDay }}>
    <!-- waiting for https://github.com/sveltejs/svelte/pull/8637 -->
    {@const events = eventsByDay}
    <div class="days" use:infinitescroll={currentWeek ? undefined : PageEventsList.loadNextPage}>
      {#each events.edges.filter(notNull) as { node: { date, happening, shotgunning } }}
        <section class="day">
          <CalendarDay
            showMonth={loaded(date) && date.getMonth() !== new Date().getMonth()}
            day={date}
          />
          <div class="shotguns-and-events">
            {#if shotgunning.length > 0}
              <div class="shotguns" class:open={loaded(date) && openedShotgunsList === date}>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <header
                  on:click={(e) => {
                    if (!loaded(date)) return;
                    handleClickOnShotgunListHeader(date, e);
                  }}
                >
                  <ul class="groups nobullet">
                    {#each new Set(shotgunning.map((s) => s.group.uid)) as groupUid}
                      <li>
                        <img
                          class="group-logo"
                          src={groupLogoSrc(
                            $isDark,
                            shotgunning.find((s) => s.group.uid === groupUid)?.group ?? {
                              pictureFile: '',
                              pictureFileDark: '',
                            },
                          )}
                          alt={loading(groupUid, '')}
                        />
                      </li>
                    {/each}
                  </ul>
                  {shotgunning.length} shotgun{shotgunning.length > 1 ? 's' : ''}
                  <ButtonGhost
                    on:click={() => {
                      if (!loaded(date)) return;
                      openedShotgunsList = openedShotgunsList === date ? undefined : date;
                    }}
                  >
                    <IconChevronDown></IconChevronDown>
                  </ButtonGhost>
                </header>
                <ul class="nobullet shotguns-list">
                  {#each shotgunning as shotgun}
                    <li>
                      <img
                        class="group-logo"
                        src={groupLogoSrc($isDark, shotgun.group)}
                        alt={loading(shotgun.group.name, '')}
                      />
                      {#if allLoaded(shotgun)}
                        <a href="/events/{shotgun.group.uid}/{shotgun.uid}">{shotgun.title}</a>
                      {:else}
                        <LoadingText>Lorem ipsum</LoadingText>
                      {/if}
                      {#if shotgun.mySoonestShotgunOpensAt}
                        <strong
                          ><LoadingText
                            value={mapLoading(shotgun.mySoonestShotgunOpensAt, (date) =>
                              format(date, 'HH:mm'),
                            )}>00:00</LoadingText
                          ></strong
                        >
                      {/if}
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}
            {#if happening.length > 0}
              <ul class="nobullet events-of-day">
                {#each happening as event}
                  <li>
                    {#if event}
                      <CardEvent
                        bind:expandedEventId
                        collapsible
                        href={onceAllLoaded(
                          [event.group.uid, event.uid],
                          (groupUid, uid) => `/events/${groupUid}/${uid}`,
                          '',
                        )}
                        {event}
                      />
                    {/if}
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        </section>
      {:else}
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
      {/each}
      {#if !currentWeek && $PageEventsList.pageInfo.hasNextPage}
        <section data-infinitescroll-bottom class="loading">
          <LoadingSpinner></LoadingSpinner>
        </section>
      {/if}
    </div>
  </MaybeError>
</div>

<style lang="scss">
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

  .shotguns .groups {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
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

  .shotguns-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
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

  section.loading {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }

  .navigation {
    position: fixed;
    right: 0;
    bottom: 2rem;
    left: 0;
    z-index: 10;
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-around;
    padding: 1rem 0;
    margin-bottom: 2rem;
    color: var(--text);
    background: var(--bg);
    transition: bottom 0.5s ease;
  }

  @media (min-width: $breakpoint-navbar-side) {
    .navigation {
      position: fixed;
      right: unset;
      left: 50%;
      min-width: 600px;
      box-shadow: var(--shadow-big);
      transform: translateX(-50%);
    }
  }

  :global(.gif) {
    width: 50% !important;
    background: none !important;
  }
</style>
