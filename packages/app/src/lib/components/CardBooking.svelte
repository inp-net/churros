<script lang="ts">
  import { fragment, graphql, type CardBooking } from '$houdini';
  import { allLoaded, loading, LoadingText, mapAllLoading } from '$lib/loading';
  import { BookingStatus, AvatarUser } from '$lib/components';
  import { isMobile } from '$lib/mobile';
  import { refroute } from '$lib/navigation';

  const mobile = isMobile();

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
        beneficiaryUser {
          ...AvatarUser
        }
        beneficiary
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
            ...TextEventDates
            organizer {
              name
              uid
              ...AvatarGroup
            }
          }
        }
      }
    `),
  );
</script>

<div class="booking-with-has-more" class:has-more={hasMoreBookingsCount}>
  <article class="booking" class:mobile class:has-image={Boolean(loading($data?.pictureURL, ''))}>
    {#if $data && loading($data?.pictureURL, '')}
      <img src={loading($data.pictureURL, '')} class="background" alt="" />
    {/if}
    <p class="name">
      <LoadingText value={$data.name} />
    </p>
    <p class="beneficiary">
      Pour {#if allLoaded($data.beneficiaryUser) && $data.beneficiaryUser}
        <AvatarUser user={$data.beneficiaryUser} />
      {/if}<LoadingText
        value={mapAllLoading(
          [$data.beneficiary, $data.beneficiaryUser],
          (b, u) => b || u?.name || 'moi',
        )}
      />
    </p>
    <p class="status">
      <BookingStatus booking={$data} />
    </p>
  </article>
  {#if hasMoreBookingsCount > 0}
    <a
      href={refroute('/events/[id]/my-bookings', loading($data.localID, ''))}
      class="more-bookings"
    >
      +{hasMoreBookingsCount}
    </a>
  {/if}
</div>

<style>
  article {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 2rem 1rem;

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
</style>
