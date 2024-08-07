<script lang="ts">
  import { fragment, graphql, type CardBooking } from '$houdini';
  import { BookingStatus } from '$lib/components';
  import { loading, LoadingText } from '$lib/loading';
  import { isMobile } from '$lib/mobile';
  import { refroute } from '$lib/navigation';

  const mobile = isMobile();

  /** The component is being rendering above page content */
  export let floating = false;

  /** If non-zero, shows an additional area where the user can go see all their bookings for the event, and displays this count */
  export let hasMoreBookingsCount = 0;

  export let booking: CardBooking;
  $: data = fragment(
    booking,
    graphql(`
      fragment CardBooking on Registration @loading {
        localID
        id
        code
        author {
          uid
          ...AvatarUser
        }
        ...BookingStatus
        ticket {
          name
          event {
            pictureURL
            title
          }
        }
      }
    `),
  );
</script>

<div class="booking-with-has-more" class:has-more={hasMoreBookingsCount}>
  <a href={refroute('/bookings/[code]', loading($data.code, ''))}>
    <article
      class:floating
      class="booking"
      class:mobile
      class:has-image={Boolean(loading($data?.ticket.event.pictureURL, ''))}
    >
      {#if $data && loading($data?.ticket.event.pictureURL, '')}
        <img src={loading($data.ticket.event.pictureURL, '')} class="background" alt="" />
      {/if}
      <p class="name">
        <LoadingText value={$data.ticket.event.title} />
      </p>
      {#if $data.ticket.name}
        <p class="ticket">
          <LoadingText value={$data.ticket.name} />
        </p>
      {/if}
      <p class="status">
        <BookingStatus booking={$data} />
      </p>
    </article>
  </a>
  {#if hasMoreBookingsCount > 0}
    <!-- <a
      href={refroute('/events/[id]/my-bookings', loading($data.localID, ''))}
      class="more-bookings"
    > -->
    <a href="#" class="more-bookings">
      +{hasMoreBookingsCount}
    </a>
  {/if}
</div>

<style>
  article {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    background-color: var(--bg2);
  }

  article.floating {
    padding: 0 1rem;
    padding-bottom: 1rem;
    background-color: var(--bg);
  }

  article:not(.mobile) {
    border-radius: 20px;
  }

  article.floating:not(.mobile) {
    padding: 1rem 1.5rem;
    box-shadow: var(--shadow-big);
  }

  article.has-image {
    overflow: hidden;
    color: white;
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

  article > p {
    display: flex;
    gap: 0.5ch;
    align-items: center;
  }

  article > *:not(.background) {
    position: relative;
  }
</style>
