<script lang="ts">
  import {
    format,
    intlFormatDistance,
    isBefore,
    isFuture,
    isSameDay,
    isWithinInterval,
  } from 'date-fns';
  import { zeus, Visibility as VisibilityEnum } from '$lib/zeus';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import IndicatorVisibility from './IndicatorVisibility.svelte';
  import { groupLogoSrc } from '$lib/logos';
  import IconHeart from '~icons/mdi/heart-outline';
  import IconHeartFilled from '~icons/mdi/heart';
  import { isDark } from '$lib/theme';
  import { formatDateTime } from '$lib/dates';
  import { DISPLAY_VISIBILITIES } from '$lib/display';
  import ButtonGhost from './ButtonGhost.svelte';
  import { toasts } from '$lib/toasts';
  import { onMount } from 'svelte';
  import {
    type Visibility$options,
    Visibility,
    fragment,
    graphql,
    type CardFeedEvent,
  } from '$houdini';

  export let likes: number | undefined = undefined;
  export let liked = false;
  export let href: string;
  export let event: CardFeedEvent;

  $: Event = fragment(
    event,
    graphql`
      fragment CardFeedEvent on Event {
        id
        title
        descriptionPreview
        startsAt
        endsAt
        location
        visibility
        group {
          name
          uid
          pictureFile
          pictureFileDark
        }
        coOrganizers {
          name
          uid
          pictureFile
          pictureFileDark
        }
        links {
          name
          computedValue
        }
        tickets {
          uid
          name
          price
          opensAt
          closesAt
          placesLeft
          capacity
        }
      }
    `,
  );

  $: ({
    descriptionPreview,
    endsAt,
    visibility,
    id,
    links,
    location,
    coOrganizers,
    startsAt,
    tickets,
    title,
    group,
  } = $Event);

  $: authorSrc = (g: typeof group) => groupLogoSrc($isDark, g);

  let now = new Date();
  onMount(() => {
    setInterval(() => {
      now = new Date();
    }, 1000);
  });

  $: soonestTicket = (_now: Date) =>
    // eslint-disable-next-line unicorn/no-array-reduce
    tickets.reduce((ticket, soonestTicket) => {
      if (!ticket.opensAt) return soonestTicket;
      if (!soonestTicket.opensAt) return ticket;
      return soonestTicket.opensAt < ticket.opensAt ? soonestTicket : ticket;
    }, tickets[0]);

  $: lastTicketToClose = (_now: Date) =>
    // eslint-disable-next-line unicorn/no-array-reduce
    tickets.reduce((ticket, lastTicketToClose) => {
      if (!ticket.closesAt) return lastTicketToClose;
      if (!lastTicketToClose.closesAt) return ticket;
      return ticket.closesAt > lastTicketToClose.closesAt ? ticket : lastTicketToClose;
    }, tickets[0]);

  $: shotgunning = (now: Date) => {
    try {
      const start = soonestTicket(now).opensAt;
      const end = lastTicketToClose(now).closesAt;
      if (!start || !end) return false;
      return isWithinInterval(now, { start, end });
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  let formattedDates = '';
  $: try {
    formattedDates = isFuture(startsAt)
      ? intlFormatDistance(startsAt, new Date())
      : isFuture(endsAt)
        ? `Jusqu'à ${isSameDay(endsAt, new Date()) ? format(endsAt, 'HH:mm') : formatDateTime(endsAt)}`
        : intlFormatDistance(endsAt, new Date());
  } catch (error) {
    console.error(error);
  }
</script>

<div class="post-outer">
  <a {href} class="post-link">
    <article class="post">
      <div class="content">
        <header>
          <div class="organizers">
            {#each [group, ...coOrganizers] as g}
              <a href="/groups/{g.uid}" class="group-logo-link">
                {#if authorSrc}
                  <img src={authorSrc(g)} alt={g.name} class="group-logo" />
                {:else}
                  <div class="group-logo no-logo"></div>
                {/if}
              </a>
            {/each}
          </div>
          <div class="group-links">
            <a href="/groups/{group.uid}" class="group">{group.name}</a>
            {#each coOrganizers as { name, uid } (uid)}
              <span class="separator">&nbsp;×&nbsp;</span>
              <a href="/groups/{uid}" class="group">{name}</a>
            {/each}
          </div>
          {#if location}
            <span class="separator">·</span>
            <span class="where">{location}</span>
          {/if}
          <span class="separator">·</span>
          <p class="when">
            {formattedDates}
          </p>
          {#if visibility && !Object.keys(Visibility).includes(visibility)}
            <span class="visibility">
              <IndicatorVisibility {visibility}></IndicatorVisibility>
              {DISPLAY_VISIBILITIES[visibility]}
            </span>
          {/if}
        </header>
        <h2 class="title">{title}</h2>
        <p class="description">
          {descriptionPreview}
        </p>
        {#if tickets.length}
          <section class="shotgun">
            {#if shotgunning(now)}
              {@const end = lastTicketToClose(now).closesAt}
              {#if end}
                Shotgun jusqu'à {intlFormatDistance(end, now)}
              {:else}
                Shotgun sans fin
              {/if}
            {:else}
              {@const start = soonestTicket(now).opensAt}
              {#if start}
                Shotgun {isBefore(now, start) ? 'dans' : ''} {intlFormatDistance(start, now)}
              {/if}
            {/if}
          </section>
        {/if}
        {#if links.length > 0}
          <ul class="links nobullet">
            {#each links as { name, computedValue }}
              <li>
                <ButtonSecondary href={computedValue}>{name}</ButtonSecondary>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </article>
  </a>
  {#if likes !== undefined}
    <section class="likes">
      <ButtonGhost
        on:click={async () => {
          try {
            ({ toggleReaction: liked } = await $zeus.mutate({
              toggleReaction: [
                {
                  articleId: id,
                  emoji: '❤️',
                },
                true,
              ],
            }));
            if (likes !== undefined) likes += liked ? 1 : -1;
          } catch (error) {
            toasts.error('Impossible de réagir', error?.toString());
          }
        }}
      >
        <div class="inner">
          <span class="icon" class:filled={liked}>
            {#if liked}
              <IconHeartFilled></IconHeartFilled>
            {:else}
              <IconHeart></IconHeart>
            {/if}
          </span>
          {likes}
        </div>
      </ButtonGhost>
    </section>
  {/if}
</div>

<style>
  article {
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: var(--radius-block);
  }

  a:hover article {
    background: var(--hover-bg);
  }

  .post-link {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .content {
    flex-grow: 1;
    grid-column: 2;
  }

  .organizers {
    display: flex;
    flex-flow: row-reverse wrap;
    align-items: center;
  }

  .group-logo {
    grid-row: 1 / 2;
    width: 2rem;
    height: 2rem;
    overflow: hidden;
    object-fit: contain;
    background: var(--bg);
    border: 2px solid var(--muted-border);
    border-radius: 50%;
  }

  article:hover .group-logo {
    background: var(--hover-bg);
  }

  .group-logo-link {
    flex-shrink: 0;
    transition: all 0.25s ease;
  }

  .group-logo-link:not(:last-child) {
    margin-left: -0.75rem;
  }

  .group-logo-link:hover .group-logo,
  .group-logo-link:focus-visible .group-logo {
    border-color: var(--primary-link);
  }

  .group-logo-link:hover,
  .group-logo-link:focus-visible {
    z-index: 10;
  }

  article:hover .group-logo-link,
  article:focus-within .group-logo-link {
    margin-left: 0;
  }

  a.group {
    font-weight: bold;
  }

  a.group:hover,
  a.group:focus-visible {
    color: var(--primary-link);
  }

  header {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.5ch;
    align-items: center;
    margin-bottom: 0.25rem;
  }

  .visibility {
    font-size: 0.7em;
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;
    margin-top: 0.5rem;
  }

  section.likes {
    margin-left: 1rem;
  }

  .likes .inner {
    display: flex;
    column-gap: 0.5ch;
    align-items: center;
    font-size: 1.1em;
    font-weight: bold;
  }

  .likes .inner .icon {
    font-size: 0.8em;
  }

  .likes .inner .icon.filled {
    color: red;
  }
</style>
