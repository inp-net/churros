<script lang="ts">
  import { goto } from '$app/navigation';
  import { EventFrequency, fragment, graphql, PendingValue, type CardEvent } from '$houdini';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { formatDateTime, formatEventDates, formatRecurrence } from '$lib/dates';
  import { allLoaded, loaded, loading, onceLoaded } from '$lib/loading';
  import { formatDuration, formatRelative, intervalToDuration, isFuture, isPast } from 'date-fns';
  import fr from 'date-fns/locale/fr/index.js';
  import { onDestroy, onMount } from 'svelte';
  import IconWhen from '~icons/mdi/calendar-outline';
  import ChevronUp from '~icons/mdi/chevron-up';
  import IconDots from '~icons/mdi/dots-horizontal';
  import IconGear from '~icons/mdi/gear-outline';
  import IconLocation from '~icons/mdi/location-outline';
  import AvatarPerson from './AvatarPerson.houdini.svelte';
  import ButtonInk from './ButtonInk.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';

  export let collapsible = false;
  export let href: string;
  export let expandedEventId: string | undefined = undefined;
  export let id: string;
  $: collapsed = collapsible && expandedEventId !== id;

  export let event: CardEvent;
  $: data = fragment(
    event,
    graphql(`
      fragment CardEvent on Event @loading {
        pictureURL
        title
        descriptionPreview
        startsAt
        endsAt
        location
        capacity
        placesLeft
        frequency
        recurringUntil
        tickets {
          uid
          name
          price
          opensAt
          closesAt
          placesLeft
          capacity
        }
        author {
          uid
          ...AvatarPerson
        }
        group {
          name
          uid
          pictureFile
        }
        canEdit
      }
    `),
  );

  let shotgunsStart: Date | null;
  let shotgunsEnd: Date | null;

  $: ({ tickets, author, group } = $data);

  function updateShotgunDates(tickets: (typeof $data)['tickets']) {
    if (!allLoaded(tickets)) return;
    if (tickets[0]) shotgunsStart = tickets[0].opensAt;

    for (const ticket of tickets) {
      if (ticket.opensAt && (!shotgunsStart || ticket.opensAt < shotgunsStart))
        shotgunsStart = ticket.opensAt;
    }

    if (tickets[0]) shotgunsEnd = tickets[0].closesAt;

    for (const ticket of tickets) {
      if (ticket.closesAt && (!shotgunsEnd || ticket.closesAt > shotgunsEnd))
        shotgunsEnd = ticket.closesAt;
    }
  }

  $: updateShotgunDates(tickets);

  // Est-ce que le shotgun est en cours ? Mis à jour toutes les secondes
  $: shotgunning =
    (!shotgunsEnd && !shotgunsStart) ||
    (shotgunsEnd &&
      shotgunsStart &&
      isFuture(new Date(shotgunsEnd)) &&
      isPast(new Date(shotgunsStart)));

  // Date actuelle mise à jour toutes les secondes
  $: now = new Date();

  let interval: ReturnType<typeof setInterval>;

  const updateTime = () => {
    now = new Date();
    shotgunning =
      (!shotgunsEnd && !shotgunsStart) ||
      (shotgunsEnd &&
        shotgunsStart &&
        isFuture(new Date(shotgunsEnd)) &&
        isPast(new Date(shotgunsStart)));
  };

  onMount(() => {
    updateTime(); // Appel initial pour afficher le compte à rebours dès le rendu du composant
    interval = setInterval(updateTime, 1000); // Mettre à jour toutes les secondes
  });

  onDestroy(() => {
    clearInterval(interval); // Nettoyer l'intervalle lorsque le composant est détruit
  });

  async function gotoEventIfNotLink(e: MouseEvent | KeyboardEvent) {
    if (!(e.target instanceof HTMLElement)) return;
    if (e.target.closest('a, button')) return;

    if (e instanceof MouseEvent || (e instanceof KeyboardEvent && e.key === 'Enter'))
      await goto(href);
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<article
  data-href={href}
  class:collapsed
  class="event"
  on:click={gotoEventIfNotLink}
  on:keypress={gotoEventIfNotLink}
>
  <section
    class:has-picture={Boolean($data.pictureURL)}
    class="title"
    style:color={loaded($data.pictureURL) && $data.pictureURL ? 'white' : 'var(--text)'}
    style:background-image={onceLoaded(
      $data.pictureURL,
      (url) =>
        url
          ? `linear-gradient(rgb(0 0 0 / var(--alpha)), rgb(0 0 0 / var(--alpha))), url('${url}') `
          : undefined,
      undefined,
    )}
  >
    <a class="title-link" {href}
      ><h2 class="title-text">
        <LoadingText value={$data.title}>Lorem ipsum dolor</LoadingText>
      </h2></a
    >
    {#if collapsible}
      <button
        class="expand-collapse chevron-up {collapsed ? 'collapsed' : ''}"
        on:click={() => {
          expandedEventId = collapsed ? id : '';
        }}><ChevronUp /></button
      >
    {/if}
  </section>
  <section class="content {collapsed ? 'collapsed' : ''}">
    <section class="desc">
      <LoadingText value={$data.descriptionPreview} lines={2}></LoadingText>
      <ButtonInk insideProse {href} icon={IconDots}>Voir plus</ButtonInk>
    </section>
    <section class="schedule">
      <h4 class="typo-field-label">Évènement</h4>
      <p>
        <IconWhen />
        {#if !loaded($data.startsAt) || !loaded($data.endsAt) || !loaded($data.frequency) || !loaded($data.recurringUntil)}
          <LoadingText>Dans 3 jours</LoadingText>
        {:else if $data.frequency === EventFrequency.Once}
          {formatEventDates($data)}
        {:else}
          {formatRecurrence($data.frequency, $data.startsAt, $data.endsAt)}
        {/if}
      </p>
      {#if location}
        <p><IconLocation /> {location}</p>
      {/if}
    </section>

    <!-- Je vois pas pourquoi il y en aurait pas mais dans la db c'est possible -->
    <!-- uwun: si ya pas de billets :p -->
    {#if shotgunsStart && loaded($data.placesLeft) && loaded($data.capacity)}
      <section class="shotgun">
        <h4 class="typo-field-label">Shotgun</h4>
        {#if shotgunning && $data.placesLeft !== null && $data.placesLeft !== null}
          <p>
            {#if $data.placesLeft + $data.capacity === Number.POSITIVE_INFINITY}
              Places illimitées
            {:else}
              <!-- <strong>
                <span style={placesLeft < 0.1 * capacity ? 'color: var(--error)' : ''}>
                  {placesLeft}
                </span>/ {capacity}
              </strong> places restantes -->
            {/if}
          </p>
          <div class="places">
            {#each tickets as { uid, name, price }}
              <div class="link">
                <ButtonSecondary
                  tabindex={collapsed ? -1 : undefined}
                  href={onceLoaded(uid, (uid) => `${href}/book/${uid}`, '')}
                >
                  <strong>
                    <LoadingText value={name}>Billet</LoadingText>
                    <span class="ticket-price">
                      <LoadingText value={price}>10</LoadingText> €
                    </span>
                  </strong>
                </ButtonSecondary>
              </div>
            {/each}
          </div>
        {:else}
          <p>
            <!-- Si > 6j : affichage de la date, si inferieur à 6j : affichage en relatif, si inférieur à 15 minutes, affichage du décompte-->
            {Math.abs(shotgunsStart.getTime() - now.getTime()) > 6 * 24 * 3600 * 1000
              ? formatDateTime(shotgunsStart)
              : Math.abs(shotgunsStart.getTime() - now.getTime()) > 15 * 60 * 1000
                ? formatRelative(shotgunsStart, now, {
                    locale: fr,
                    weekStartsOn: 1,
                  }).replace('prochain ', '')
                : (shotgunsStart.getTime() - now.getTime() > 0 ? 'dans ' : 'il y a ') +
                  formatDuration(
                    intervalToDuration({
                      start: now,
                      end: new Date(shotgunsStart.getTime()),
                    }),
                    {
                      locale: fr,
                    },
                  )}
          </p>
        {/if}
      </section>
    {/if}

    <!-- Pas d'auteur si le bonhomme supprime son compte-->
    {#if author}
      <section class="author">
        <AvatarPerson
          href={onceLoaded(author.uid, (uid) => `/users/${uid}`, '')}
          showRoleFor={onceLoaded(group, (g) => g.uid, PendingValue)}
          person={author}
        />
      </section>
    {/if}
    {#if loading($data.canEdit, false)}
      <div class="button-admin">
        <ButtonSecondary href={href + '/edit/'}><IconGear /></ButtonSecondary>
      </div>
    {/if}
  </section>
</article>

<style>
  .event {
    overflow: hidden;
    cursor: pointer;
    border-radius: var(--radius-block);
    box-shadow: var(--primary-shadow);

    --alpha: 0.5;
  }

  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    /* ça sert à ce que la hauteur ne varie pas selon si c'est collapsible ou pas */
    min-height: 5rem;
    background-position: center;
    background-size: cover;
  }

  .collapsed .title {
    height: 100%;
  }

  .title-link {
    padding-left: 1em;
    overflow: hidden;
  }

  .title-text {
    line-height: 1.1;
  }

  .title:not(.has-picture) {
    padding: 0.75rem 1rem;
  }

  .title.has-picture {
    padding: 1rem;
  }

  .content {
    position: relative;
    margin: 1em;
    overflow: hidden;
    transition: margin 0.5s cubic-bezier(0, 1, 0, 1);
  }

  .content.collapsed {
    max-height: 0;
    margin: 0 1em;
  }

  .schedule,
  .shotgun {
    margin-top: 1rem;
  }

  .ticket-price {
    color: var(--muted);
  }

  .places {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: start;
  }

  .places .link {
    margin: 0.5em 0.5em 0 0;
  }

  .chevron-up {
    flex-shrink: 0;
    padding: 0;
    margin: 0;
    font-size: 2rem;
    line-height: inherit;
    color: inherit;
    text-align: inherit;
    text-decoration: none;
    appearance: none;
    cursor: pointer;
    background: none;

    /* Reset button properties */
    border: none;
    transition: transform 0.1s ease-in-out;
  }

  .chevron-up.collapsed {
    transform: rotate(180deg);
  }

  .button-admin {
    position: absolute;
    right: 0;
    bottom: 0;
  }
</style>
