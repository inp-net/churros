<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { fragment, graphql, type OverlayQuickBookings } from '$houdini';
  import CardBooking from '$lib/components/CardBooking.svelte';
  import { allLoaded } from '$lib/loading';
  import { notNull } from '$lib/typing';
  import { addHours, formatDistanceToNow, isFuture, isWithinInterval, subMinutes } from 'date-fns';
  import { fr } from 'date-fns/locale';
  import { swipe } from 'svelte-gestures';
  import { syncToLocalStorage } from 'svelte-store2storage';
  import { writable } from 'svelte/store';
  import { slide } from 'svelte/transition';
  import IconClose from '~icons/mdi/close';
  import ButtonGhost from './ButtonGhost.svelte';

  export let now: Date;

  type Registration = NonNullable<NonNullable<typeof $data>['nodes'][number]>;
  export let bookings: OverlayQuickBookings | null;
  $: data = fragment(
    bookings,
    graphql(`
      fragment OverlayQuickBookings on UserBookingsConnection {
        nodes {
          ...CardBooking
          code
          id
          cancelled
          opposed
          ticket {
            event {
              startsAt
              endsAt
            }
          }
        }
      }
    `),
  );

  function shouldShowBooking(
    hiddens: string[],
    registration: Registration,
  ): registration is Registration & { ticket: { event: { startsAt: Date; endsAt: Date } } } {
    if (!allLoaded(registration)) return false;
    try {
      return Boolean(
        !hiddens.includes(registration.id) &&
          registration.ticket.event.startsAt &&
          registration.ticket.event.endsAt &&
          isWithinInterval(now, {
            start: subMinutes(registration.ticket.event.startsAt, 30),
            end: addHours(registration.ticket.event.endsAt, 2),
          }) &&
          !registration.cancelled &&
          !registration.opposed,
      );
    } catch {
      return false;
    }
  }

  const hiddenBookings = writable([] as string[]);
  if (browser) syncToLocalStorage(hiddenBookings, 'hidden_quick_bookings');

  const touchAction = 'pan-y pinch-zoom' as unknown as 'pan-y';
</script>

{#if $data && $data.nodes.some(notNull) && !$page.url.pathname.startsWith('/bookings')}
  {@const booking = $data.nodes.find(notNull)}
  <!-- If the quick booking is not hidden and:
      - it starts in less than 30 mins; or
      - it ongoing; or 
      - was finished less than 2 hours ago -->
  {#if booking && shouldShowBooking($hiddenBookings, booking)}
    <section
      in:slide={{ axis: 'y', duration: 100 }}
      use:swipe={{ touchAction }}
      on:swipemove={(event) => {
        const {
          target,
          detail: {
            event: { movementY, movementX },
          },
        } = event;
        if (!target || !(target instanceof HTMLElement)) return;
        if (Math.abs(Math.abs(movementX) - Math.abs(movementY)) < 10) return;

        if (Math.abs(movementX) < 10) return;

        target.style.transform = `translateX(${movementX > 0 ? '+' : '-'}100vw)`;
        setTimeout(() => {
          $hiddenBookings = [...$hiddenBookings, booking.id];
        }, 500);
      }}
      class="quick-booking"
    >
      <p class="hint">
        <strong>
          C'est {#if isFuture(booking.ticket.event.startsAt)}
            dans {formatDistanceToNow(booking.ticket.event.startsAt, {
              locale: fr,
            }).replace('environ ', '')}{:else}maintenant{/if}! Voici ta place
        </strong>
        <span class="dismiss">
          <ButtonGhost
            on:click={() => {
              $hiddenBookings = [...$hiddenBookings, booking.id];
            }}
          >
            <IconClose></IconClose>
          </ButtonGhost>
        </span>
      </p>
      <CardBooking floating {booking} />
    </section>
  {/if}
{/if}

<style>
  .quick-booking {
    position: fixed;
    right: 0;
    bottom: 4.5rem;
    left: 0;
    z-index: 20;
    width: 100%;
    transition: all 0.25s ease;
    transform: translateX(0);
  }

  @media (min-width: 600px) {
    .quick-booking {
      right: 1rem;
      left: unset;
      max-width: 400px;
    }
  }

  .hint {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.5rem;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem;
    text-align: center;

    /* fade from transparent to var(--bg) */
    background: linear-gradient(to bottom, transparent 0%, var(--bg) 60%);
  }
</style>
