<script lang="ts">
  import { env } from '$env/dynamic/public';
  import AvatarPerson from './AvatarPerson.svelte';
  import {
    formatDuration,
    formatRelative,
    intervalToDuration,
    isFuture,
    isPast,
    format,
  } from 'date-fns';
  import IconLocation from '~icons/mdi/location-outline';
  import IconWhen from '~icons/mdi/calendar-outline';
  import { formatDateTime } from '$lib/dates';
  import fr from 'date-fns/locale/fr/index.js';
  import { onDestroy, onMount } from 'svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import IconGear from '~icons/mdi/gear-outline';
  import ChevronUp from '~icons/mdi/chevron-up';
  import { goto } from '$app/navigation';
  import { htmlToText } from 'html-to-text';

  export let collapsible = false;
  export let expandedEventId: string | undefined = undefined;
  export let id: string;
  $: collapsed = collapsible && expandedEventId !== id;
  export let pictureFile: string;
  export let title: string;
  export let descriptionHtml: string;
  export let startsAt: Date;
  export let endsAt: Date;
  export let location: string;
  export let tickets: Array<{
    name: string;
    price: number;
    uid: string;
    opensAt?: Date;
    closesAt?: Date;
    placesLeft: number;
    capacity: number;
  }>;
  export let href: string;
  export let author:
    | {
        uid: string;
        pictureFile: string;
        fullName: string;
        groups: Array<{
          title: string;
          group: {
            name: string;
            uid: string;
          };
        }>;
      }
    | undefined = undefined;
  export let group: {
    name: string;
    uid: string;
    pictureFile: string;
  };
  export let canEdit: boolean | undefined = false;

  let shotgunsStart: Date | undefined;
  let shotgunsEnd: Date | undefined;

  if (tickets[0]) shotgunsStart = tickets[0].opensAt;

  for (const ticket of tickets) {
    if (ticket.opensAt && (shotgunsStart === undefined || ticket.opensAt < shotgunsStart))
      shotgunsStart = ticket.opensAt;
  }

  if (tickets[0]) shotgunsEnd = tickets[0].closesAt;

  for (const ticket of tickets) {
    if (ticket.closesAt && (shotgunsEnd === undefined || ticket.closesAt > shotgunsEnd))
      shotgunsEnd = ticket.closesAt;
  }

  const totalPlacesLeft = tickets.reduce(
    (sum, { placesLeft }) => sum + (placesLeft === -1 ? Number.POSITIVE_INFINITY : placesLeft),
    0
  );
  const totalCapacity = tickets.reduce(
    (sum, { capacity }) => sum + (capacity === 0 ? Number.POSITIVE_INFINITY : capacity),
    0
  );

  // Est-ce que le shotgun est en cours ? Mis à jour toutes les secondes
  $: shotgunning =
    (!shotgunsEnd && !shotgunsStart) ||
    (shotgunsEnd &&
      shotgunsStart &&
      isFuture(new Date(shotgunsEnd)) &&
      isPast(new Date(shotgunsStart)));

  // Date actuelle mise à jour toutes les secondes
  $: now = new Date();

  let interval: NodeJS.Timeout;

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
    class:has-picture={Boolean(pictureFile)}
    class="title"
    style:color={pictureFile ? 'white' : 'var(--text)'}
    style:background-image={pictureFile
      ? `linear-gradient(rgb(0 0 0 / var(--alpha)), rgb(0 0 0 / var(--alpha))), url('${env.PUBLIC_STORAGE_URL}${pictureFile}') `
      : undefined}
  >
    <a class="title-link" {href}><h2 class="title-text">{title}</h2></a>
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
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html (
        htmlToText(descriptionHtml)
          .split('\n')
          .find((line) => line.trim() !== '') ?? ''
      ).slice(0, 255)}
    </section>
    <section class="schedule">
      <h4 class="typo-field-label">Évènement</h4>
      <p>
        <IconWhen />
        {Math.abs(startsAt.getTime() - now.getTime()) > 7 * 24 * 3600 * 1000
          ? formatDateTime(startsAt)
          : formatRelative(startsAt, now, {
              locale: fr,
              weekStartsOn: 1,
            })
              .replace('prochain ', '')
              .replace('à ', '')}
        —
        {Math.abs(endsAt.getTime() - now.getTime()) > 7 * 24 * 3600 * 1000
          ? startsAt.getDate() === endsAt.getDate()
            ? format(endsAt, 'p', {
                locale: fr,
                weekStartsOn: 1,
              })
            : formatDateTime(endsAt)
          : startsAt.getDate() === endsAt.getDate()
          ? format(endsAt, 'p', {
              locale: fr,
              weekStartsOn: 1,
            })
          : formatRelative(endsAt, now, {
              locale: fr,
              weekStartsOn: 1,
            })
              .replace('prochain ', '')
              .replace('à ', '')}
      </p>
      {#if location}
        <p><IconLocation /> {location}</p>
      {/if}
    </section>

    <!-- Je vois pas pourquoi il y en aurait pas mais dans la db c'est possible -->
    <!-- uwun: si ya pas de billets :p -->
    {#if shotgunsStart}
      <section class="shotgun">
        <h4 class="typo-field-label">Shotgun</h4>
        {#if shotgunning}
          <p>
            {#if totalPlacesLeft + totalCapacity === Number.POSITIVE_INFINITY}
              Places illimitées
            {:else}
              <strong>
                <span style={totalPlacesLeft < 0.1 * totalCapacity ? 'color: var(--error)' : ''}>
                  {totalPlacesLeft}
                </span>/ {totalCapacity}
              </strong> places restantes
            {/if}
          </p>
          <div class="places">
            {#each tickets as { uid, name, price }}
              <div class="link">
                <ButtonSecondary tabindex={collapsed ? -1 : undefined} href={`${href}/book/${uid}`}>
                  <strong>
                    {name}
                    <span class="ticket-price">{price} €</span>
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
                  }
                )}
          </p>
        {/if}
      </section>
    {/if}

    <!-- Pas d'auteur si le bonhomme supprime son compte-->
    {#if author}
      <section class="author">
        <AvatarPerson
          href="/users/{author.uid}"
          role={author.groups.find((g) => g.group.uid === group.uid)?.title ?? ''}
          {...author}
        />
      </section>
    {/if}
    {#if canEdit}
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
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-evenly;

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
    text-align: center;
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
    padding: 0;
    margin: 0;
    font-size: 2rem;
    line-height: inherit;
    color: inherit;
    text-align: inherit;
    text-decoration: none;
    cursor: pointer;
    background: none;

    /* Reset button properties */
    border: none;
    transition: transform 0.1s ease-in-out;
    appearance: none;
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
