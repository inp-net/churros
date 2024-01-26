<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { addHours, formatDistanceToNow, isFuture, isWithinInterval, subMinutes } from 'date-fns';
  import fr from 'date-fns/locale/fr/index.js';
  import { swipe } from 'svelte-gestures';
  import { syncToLocalStorage } from 'svelte-store2storage';
  import { writable } from 'svelte/store';
  import { slide } from 'svelte/transition';
  import IconClose from '~icons/mdi/close';
  import ButtonGhost from './ButtonGhost.svelte';
  import CardTicket from './CardTicket.svelte';
  import { fragment, graphql, type QuickBooking } from '$houdini';

  type Registration = {
    id: string;
    code: unknown;
    beneficiary: string;
    authorIsBeneficiary: boolean;
    paid: boolean;
    cancelled: boolean;
    opposed: boolean;
    author?: { fullName: string } | undefined;
    authorEmail: string;
    beneficiaryUser?: { fullName: string } | undefined;
    ticket: {
      name: string;
      event: { pictureFile: string; title: string; startsAt: Date; endsAt: Date };
    };
  };

  export let quickBookingStore: QuickBooking;
  $: quickBooking = fragment(
    quickBookingStore,
    graphql`
      fragment QuickBooking on Registration {
        id
        code
        beneficiary
        authorIsBeneficiary
        paid
        cancelled
        author {
          fullName
        }
        authorEmail
        beneficiaryUser {
          fullName
        }
        ticket {
          name
          event {
            pictureFile
            title
            startsAt
            endsAt
          }
        }
      }
    `,
  );

  export let now: Date;

  function shouldShowBooking(
    hiddens: string[],
    registration: {
      id: string;
      cancelled: boolean;
      ticket: { event: { startsAt: Date; endsAt: Date } };
    },
  ): boolean {
    try {
      return (
        !hiddens.includes(registration.id) &&
        isWithinInterval(now, {
          start: subMinutes(registration.ticket.event.startsAt, 30),
          end: addHours(registration.ticket.event.endsAt, 2),
        }) &&
        !registration.cancelled &&
        !registration.opposed
      );
    } catch {
      return false;
    }
  }

  const hiddenBookings = writable([] as string[]);
  if (browser) syncToLocalStorage(hiddenBookings, 'hidden_quick_bookings');

  // See https://github.com/Rezi/svelte-gestures/pull/21
  const touchAction = 'pan-y pinch-zoom' as unknown as 'pan-y';
</script>

{#if !$page.url.pathname.startsWith('/bookings') && quickBooking}
  <!-- If the quick booking is not hidden and:
      - it starts in less than 30 mins; or
      - it ongoing; or 
      - was finished less than 2 hours ago -->
  {#if shouldShowBooking($hiddenBookings, $quickBooking)}
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
          $hiddenBookings = [...$hiddenBookings, $quickBooking.id];
        }, 500);
      }}
      class="quick-booking"
    >
      <p class="hint">
        <strong>
          C'est {#if isFuture($quickBooking.ticket.event.startsAt)}
            dans {formatDistanceToNow($quickBooking.ticket.event.startsAt, {
              locale: fr,
            }).replace('environ ', '')}{:else}maintenant{/if}! Voici ta place
        </strong>
        <span class="dismiss">
          <ButtonGhost
            on:click={() => {
              $hiddenBookings = [...$hiddenBookings, $quickBooking.id];
            }}
          >
            <IconClose></IconClose>
          </ButtonGhost>
        </span>
      </p>
      <CardTicket floating href="/bookings/{$quickBooking.code}" {...$quickBooking}></CardTicket>
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
