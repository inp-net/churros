<script lang="ts">
  import {
    differenceInMinutes,
    differenceInSeconds,
    formatDistanceToNow,
    formatDuration,
    formatRelative,
    isFuture,
    isPast,
  } from 'date-fns';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import fr from 'date-fns/locale/fr/index.js';
  import IconChevronRight from '~icons/mdi/chevron-right';
  import { onDestroy, onMount } from 'svelte';
  import { tooltip } from '$lib/tooltip';
  import { isDark } from '$lib/theme';
  import { groupLogoSrc } from '$lib/logos';
  import { route } from '$lib/ROUTES';

  export let group: undefined | null | { name: string } = undefined;
  export let descriptionHtml: string;
  export let name: string;
  export let placesLeft: number | null | undefined = undefined;
  export let capacity: number;
  export let uid: string;
  export let price: number;
  export let closesAt: Date | undefined | null = undefined;
  export let opensAt: Date | undefined | null = undefined;
  export let event: { localID: string };
  export let openToGroups: Array<{
    uid: string;
    name: string;
    pictureFile: string;
    pictureFileDark: string;
  }>;

  let stateUpdateInterval: number | undefined = undefined;

  let shotgunning = isShotgunning();
  let timingText = getTimingText();
  let closingSoon = isClosingSoon();
  let closingVerySoon = isClosingVerySoon();

  function isClosingSoon() {
    if (!closesAt) return false;
    if (!isShotgunning()) return false;
    return differenceInMinutes(new Date(closesAt), new Date()) < 15;
  }

  function isClosingVerySoon() {
    if (!closesAt) return false;
    if (!isShotgunning()) return false;
    return differenceInMinutes(new Date(closesAt), new Date()) < 5;
  }

  function isShotgunning() {
    return (
      (!closesAt && !opensAt) ||
      (closesAt && opensAt && isFuture(new Date(closesAt)) && isPast(new Date(opensAt)))
    );
  }

  function getTimingText() {
    if (!opensAt && !closesAt) return `Shotgun intemporel`;
    if (opensAt && isFuture(new Date(opensAt)))
      return `Shotgun ${formatRelative(new Date(opensAt), new Date(), { locale: fr })}`;
    if (closesAt) {
      if (isPast(new Date(closesAt)))
        return `En vente jusqu'à ${formatRelative(new Date(closesAt), new Date(), { locale: fr })}`;

      if (differenceInMinutes(new Date(closesAt), new Date()) < 1) {
        return `Plus que ${formatDuration(
          { seconds: differenceInSeconds(new Date(closesAt), new Date()) },
          { locale: fr },
        )} pour shotgun !!!!`;
      }

      return `Plus que ${formatDistanceToNow(new Date(closesAt), {
        locale: fr,
        includeSeconds: true,
      })} pour
          shotgun`;
    }
  }

  onMount(() => {
    stateUpdateInterval = setInterval(() => {
      shotgunning = isShotgunning();
      timingText = getTimingText();
      closingSoon = isClosingSoon();
      closingVerySoon = isClosingVerySoon();
    }, 1000) as unknown as number;
  });

  onDestroy(() => {
    if (stateUpdateInterval) clearInterval(stateUpdateInterval);
  });
</script>

<article class="ticket">
  <div class="text-and-numbers">
    <div class="text">
      <h3>
        {#if openToGroups.length}
          <ul class="groups nobullet">
            {#each openToGroups as { name, uid, ...pictures }}
              {@const logoSrc = groupLogoSrc($isDark, pictures)}
              <li>
                {#if logoSrc}
                  <a class="group" use:tooltip={name} href="/groups/{uid}">
                    <img src={logoSrc} alt={name} />
                  </a>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
        {#if group}{group.name} <IconChevronRight />
        {/if}{name}
      </h3>
      <div class="description" data-user-html>
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html descriptionHtml}
      </div>
    </div>
    <div class="numbers">
      <span class="places">
        {#if placesLeft === -1 || placesLeft === Number.POSITIVE_INFINITY}
          Illimité
        {:else if placesLeft === null}
          {capacity} places
        {:else}
          <span class="left">{placesLeft}</span><span class="capacity">{capacity}</span>
        {/if}
      </span>
      {#if !shotgunning}
        <span class="separator">·</span>
      {/if}
      <div class="price">
        {#if shotgunning}
          <ButtonSecondary
            track="book"
            trackData={{ event: route('/events/[id]', event.localID), ticket: uid }}
            help={placesLeft === 0 ? 'Plus de places :/' : ''}
            disabled={placesLeft === 0}
            href={route('/events/[id]/book/[ticket]', { id: event.localID, ticket: uid })}
          >
            Réserver
            <strong>
              <span class="ticket-price">{price} €</span>
            </strong>
          </ButtonSecondary>
        {:else}
          {price} €
        {/if}
      </div>
    </div>
  </div>
  <p
    class="timing typo-details"
    class:soon={closingSoon && !closingVerySoon}
    class:very-soon={closingVerySoon}
  >
    {timingText}
  </p>
</article>

<style lang="scss">
  .ticket {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    align-items: center;
    padding: 1rem;

    &:not(.soon, .very-soon) {
      background: var(--muted-bg);
    }

    border-radius: var(--radius-block);

    h3 {
      display: flex;
      align-items: center;
    }

    .text-and-numbers {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem 0.5rem;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .numbers {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      justify-content: center;
    }

    .groups {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      align-items: center;
      margin-right: 0.5rem;

      .group img {
        width: 2rem;
        height: 2rem;
        font-size: 0.5em;
        object-fit: contain;
      }
    }

    .timing {
      margin-top: 0.5rem;
      font-weight: normal;

      &.soon,
      &.very-soon {
        font-weight: bold;
      }

      &.soon {
        color: var(--danger-link);
      }

      &.very-soon {
        animation: pulse-text 1s infinite;
      }
    }
  }

  .places .left::after {
    display: inline-block;
    height: 1.25em;
    margin: 0.3em;
    margin-bottom: -0.25em;
    content: '';
    background: var(--text);
    transform: rotate(30deg);
  }

  h2 .places .left::after {
    width: 3px;
  }

  .ticket .places .left::after {
    width: 1px;
  }

  @keyframes pulse-text {
    0% {
      color: var(--text);
    }

    25% {
      color: var(--danger-link);
    }

    75% {
      color: var(--text);
    }
  }
</style>
