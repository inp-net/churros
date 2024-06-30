<script lang="ts">
  import { graphql, paginatedFragment, PendingValue, type ListEventsByDay } from '$houdini';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import CalendarDay from '$lib/components/CalendarDay.svelte';
  import CardEvent from '$lib/components/CardEvent.houdini.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { allLoaded, loaded, loading, mapLoading, onceAllLoaded } from '$lib/loading';
  import { groupLogoSrc } from '$lib/logos';
  import { infinitescroll } from '$lib/scroll';
  import { isDark } from '$lib/theme';
  import { notNull } from '$lib/typing';
  import { format } from 'date-fns';
  import { Gif } from 'svelte-tenor';
  import IconChevronDown from '~icons/mdi/chevron-down';

  export let events: ListEventsByDay;
  $: if ($paginatedData?.data.eventsByDay.edges.some((e) => e?.node.date === PendingValue)) {
    console.log('loading!!!');
  }

  $: paginatedData = paginatedFragment(
    events,
    graphql(`
      fragment ListEventsByDay on Query
      @arguments(after: { type: "String" }, before: { type: "String" }) {
        eventsByDay(first: 5, after: $after, before: $before) @loading @paginate {
          pageInfo {
            hasNextPage
            startCursor
          }
          edges @loading(count: 3, cascade: true) {
            node @loading(cascade: true) {
              date
              happening @loading(count: 2, cascade: true) {
                uid
                group {
                  uid
                }
                ...CardEvent @loading
              }

              shotgunning {
                group {
                  uid
                  name
                  pictureFile
                  pictureFileDark
                }
                title
                uid
                mySoonestShotgunOpensAt
              }
            }
          }
        }
      }
    `),
  );

  export let expandedEventId: string | undefined = undefined;
  export let openedShotgunsList: Date | undefined = undefined;

  function handleClickOnShotgunListHeader(day: Date, e: Event) {
    if (!(e.target instanceof HTMLElement)) return;
    if (e.target.closest('a, button')) return;

    if (e instanceof MouseEvent || (e instanceof KeyboardEvent && e.key === 'Enter'))
      openedShotgunsList = openedShotgunsList === day ? undefined : day;
  }
</script>

<MaybeError result={$paginatedData} let:data={{ eventsByDay }}>
  <div class="days" use:infinitescroll={async () => await paginatedData.loadNextPage()}>
    {#each eventsByDay?.edges.filter(notNull) ?? [] as { node: { date, happening, shotgunning } }}
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
      {#if $paginatedData.pageInfo.hasNextPage}
        <section class="loading">
          <LoadingSpinner></LoadingSpinner>
        </section>
      {/if}
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
  </div>
</MaybeError>

<style>
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

  :global(.gif) {
    width: 50% !important;
    background: none !important;
  }
</style>
