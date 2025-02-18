<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { fragment, graphql, PendingValue, type CardEvent } from '$houdini';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { formatEventDates } from '$lib/dates';
  import { sentenceJoin } from '$lib/i18n';
  import {
    allLoaded,
    loading,
    mapAllLoading,
    mapLoading,
    onceAllLoaded,
    onceLoaded,
  } from '$lib/loading';
  import { isMobile } from '$lib/mobile';
  import { refroute } from '$lib/navigation';
  import { route as _route } from '$lib/ROUTES';
  import { format, isWithinInterval } from 'date-fns';
  import { onMount } from 'svelte';
  import IconDates from '~icons/msl/calendar-today-outline';
  import IconLocation from '~icons/msl/location-on-outline';
  import IconLockOpen from '~icons/msl/lock-open-outline';
  import IconLock from '~icons/msl/lock-outline';
  import IconTime from '~icons/msl/schedule-outline';
  import AvatarGroup from './AvatarGroup.houdini.svelte';
  import ButtonInk from './ButtonInk.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import CardTicket from './CardTicket.svelte';

  /**
   * Whether this component should announce a shotgun instead of the event itself
   */
  export let shotgun = false;

  /**
   * Whether to add a ?from= query parameter to the event link
   */
  export let referrer = false;
  $: route = referrer ? refroute : _route;

  $: ({ RootLayout } = $page.data);
  $: loggedIn = Boolean($RootLayout?.data?.loggedIn);

  const mobile = isMobile();

  export let showTickets = true;

  export let event: CardEvent | null;
  $: data = fragment(
    event,
    graphql(`
      fragment CardEvent on Event @loading {
        localID
        pictureURL
        title
        descriptionPreview
        organizer {
          name
          uid
          ...AvatarGroup
        }
        coOrganizers {
          name
          uid
        }
        startsAt
        endsAt
        location
        frequency
        recurringUntil
        canEdit
        tickets {
          ...CardTicket
          opensAt
          closesAt
        }
      }
    `),
  );

  $: ticket = $data?.tickets?.at(0);

  $: subtitle = $data
    ? shotgun && ticket
      ? mapLoading($data.title, (t) => `Shotgun pour ${t}`)
      : onceAllLoaded(
          [$data.organizer.name, ...$data.coOrganizers.map((c) => c.name)],
          (organizer, ...coOrganizers) =>
            coOrganizers.length > 3
              ? `${organizer} avec ${coOrganizers.length} autres`
              : coOrganizers.length > 0
                ? `${organizer} avec ${sentenceJoin(coOrganizers)}`
                : `${organizer} présente`,
          PendingValue,
        )
    : PendingValue;

  let now = new Date();
  onMount(() => {
    setInterval(() => {
      now = new Date();
    }, 500);
  });

  $: ticketIsOpen =
    ticket &&
    mapAllLoading(
      [ticket.opensAt, ticket.closesAt],
      (start, end) => start && end && isWithinInterval(now, { start, end }),
    );
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<article
  on:click={async () =>
    goto((referrer ? refroute : route)('/events/[id]', loading($data?.localID, '') ?? ''))}
  class="event"
  class:mobile
  class:has-image={Boolean(loading($data?.pictureURL, ''))}
>
  {#if $data && loading($data?.pictureURL, '')}
    <img src={loading($data.pictureURL, '')} class="background" alt="" />
  {/if}
  <header>
    <div class="organizer" class:shotgun-open={ticketIsOpen}>
      {#if shotgun}
        <div class="locked-overlay">
          {#if ticketIsOpen}
            <IconLockOpen />
          {:else}
            <IconLock />
          {/if}
        </div>
      {/if}
      <AvatarGroup group={$data?.organizer ?? null} />
    </div>
    <div class="text">
      <div class="subtitle">
        <LoadingText value={subtitle}>Lorem dolor sit ipsum</LoadingText>
      </div>
      <div class="title">
        {#if shotgun && ticket}
          <LoadingText
            value={onceAllLoaded(
              [ticket.opensAt, ticket.closesAt],
              (start, end) =>
                !start || !end
                  ? 'Sans shotgun'
                  : ticketIsOpen
                    ? `Jusqu'à ${format(end, 'HH:mm')}`
                    : `À ${format(start, 'HH:mm')}`,
              PendingValue,
            )}>Jusqu'à 66:60</LoadingText
          >
        {:else}
          <LoadingText value={$data?.title}>Lorem ipsum dolor sit amet</LoadingText>
        {/if}
      </div>
    </div>
  </header>
  <section class="caracteristics">
    {#if shotgun && ticket && $data}
      <div class="date">
        <IconDates></IconDates>
        <LoadingText value={allLoaded($data) ? formatEventDates($data) : PendingValue}
          >Lundi 1 septembre, 00h—00h</LoadingText
        >
      </div>
    {:else if $data}
      <div class="time">
        <IconTime></IconTime>
        <LoadingText
          value={mapAllLoading([$data.startsAt, $data.endsAt], (start, end) => {
            if (!start || !end) return '(pas de dates définies)';
            return `de ${format(start, 'HH:mm')} à ${format(end, 'HH:mm')}`;
          })}>de --:-- à --:--</LoadingText
        >
      </div>
    {/if}
    {#if $data?.location}
      <div class="location">
        <IconLocation />
        <LoadingText value={$data.location}>1 Rue Skibidi, 31000 Yapville</LoadingText>
      </div>
    {/if}
  </section>
  <div class="description-preview">
    <LoadingText value={$data?.descriptionPreview ?? PendingValue} lines={2}></LoadingText>
    <ButtonInk insideProse href="">Voir plus</ButtonInk>
  </div>
  {#if showTickets && ticket && (ticketIsOpen || shotgun)}
    <section class="tickets">
      <CardTicket {ticket}></CardTicket>
      {#if $data && $data?.tickets.length > 1}
        {@const plural = $data.tickets.length - 1 > 1 ? 's' : ''}
        <div class="other-tickets">
          <ButtonInk
            neutral
            href={onceLoaded($data?.localID, (id) => (id ? route('/events/[id]', id) : ''), '')}
          >
            + {$data.tickets.length - 1} autre{plural} ticket{plural}
          </ButtonInk>
        </div>
      {/if}
    </section>
  {:else if showTickets && !loading(loggedIn, true) && shotgun}
    <section class="tickets please-login">
      <div class="ticket">
        <div class="text">
          <div class="title">Tu n'es pas connecté·e</div>
          <div class="subtitle">Connectes-toi pour shotgun ;)</div>
        </div>
        <div class="actions">
          <ButtonSecondary href={refroute('/login')}>Connexion</ButtonSecondary>
        </div>
      </div>
    </section>
  {/if}
</article>

<style>
  article {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 2rem 1rem;
    cursor: pointer;

    --glimer: var(--primary);
  }

  article:not(.mobile) {
    padding: 2rem;
    border-radius: 20px;
  }

  article.has-image {
    overflow: hidden;
    color: white;

    --glimmer: var(--primary);

    background-color: black;
  }

  article .background {
    --blur: 30px;

    position: absolute;
    inset: calc(-1 * var(--blur));
    width: calc(100% + 2 * var(--blur));
    height: calc(100% + 2 * var(--blur));
    overflow: hidden;
    object-fit: cover;
    object-position: center;
    filter: blur(var(--blur)) brightness(0.7);
  }

  article > *:not(.background) {
    position: relative;
  }

  header {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  header .organizer {
    --avatar-size: 3rem;

    position: relative;
    width: var(--avatar-size);
    height: var(--avatar-size);
  }

  header .organizer .locked-overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    color: white;
    background: rgba(0 0 0 / 50%);
    border-radius: 10000px;
  }

  header .organizer.shotgun-open .locked-overlay {
    animation: pulse-shadow 500ms ease infinite alternate;
  }

  @keyframes pulse-shadow {
    from {
      box-shadow: 0 0 0 0 var(--glimmer);
    }

    to {
      box-shadow: 0 0 20px 0.25rem var(--glimmer);
    }
  }

  header .text {
    display: flex;
    flex-direction: column;
  }

  header .subtitle {
    font-size: 0.8rem;
  }

  header .title {
    margin-top: -0.2rem;
    font-size: 1.5rem;
    line-height: 1;
  }

  section.caracteristics {
    display: flex;
    flex-flow: row wrap;
    gap: 0.25rem 1.5rem;
  }

  section.caracteristics > div {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .description-preview {
    margin-top: 0.5rem;
  }

  article.has-image .description-preview {
    --primary: white;
  }

  .tickets {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  article.has-image .tickets {
    --background: transparent;
    --color: white;
  }

  .tickets.please-login {
    --color: var(--warning);
    --background: var(--warning-bg);
  }

  .ticket {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: var(--bg2);
    border: var(--border-block) solid transparent;
    border-radius: 10px;
  }

  article.has-image .ticket {
    background-color: transparent;
    border-color: white;
  }

  .tickets.please-login .ticket {
    color: var(--warning);
    background: var(--warning-bg);
  }

  .ticket .text {
    display: flex;
    flex-direction: column;
  }

  .ticket .title {
    font-size: 1.2rem;
    line-height: 1;
  }

  .ticket .subtitle {
    font-size: 0.8em;
  }

  .other-tickets {
    margin-left: auto;
  }

  article.has-image .other-tickets {
    --fg: white;
  }
</style>
