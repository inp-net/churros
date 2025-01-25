<script lang="ts">
  import {
    fragment,
    graphql,
    type PageEventBookings_ItemBooking,
    type PageEventBookings_ItemBooking$data,
  } from '$houdini';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import BookingBeneficiary from '$lib/components/BookingBeneficiary.svelte';
  import BookingPaymentMethod from '$lib/components/BookingPaymentMethod.svelte';
  import BookingStatus from '$lib/components/BookingStatus.svelte';
  import { formatDateTimeSmart } from '$lib/dates';
  import { loading, LoadingText, mapLoading } from '$lib/loading';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    openDetails: PageEventBookings_ItemBooking$data;
  }>();

  export let showTicketNames: boolean;

  /** Highlight the booking code */
  export let highlightCode = false;

  export let booking: PageEventBookings_ItemBooking | null;
  $: data = fragment(
    booking,
    graphql(`
      fragment PageEventBookings_ItemBooking on Registration @loading {
        id
        code
        ...BookingBeneficiary
        ...BookingAuthor
        ticket {
          name
        }
        verifiedAt
        verifiedBy {
          ...AvatarUser
          fullName
        }
        cancelledAt
        cancelledBy {
          ...AvatarUser
          fullName
        }
        opposedAt
        opposedBy {
          ...AvatarUser
          fullName
        }
        updatedAt
        ...BookingPaymentMethod
        ...BookingStatus
        authorIsBeneficiary
        author {
          ...AvatarUser
          fullName
        }
      }
    `),
  );
</script>

<li>
  <button
    class="booking"
    on:click={() => {
      if (!$data) return;
      dispatch('openDetails', $data);
    }}
  >
    <div class="top">
      <div class="people">
        <div class="beneficiary">
          <BookingBeneficiary booking={$data} />
        </div>
        <div class="author desktop-only">
          {#if $data?.author && loading($data.authorIsBeneficiary, false)}
            Payé par <AvatarUser user={$data.author} />
            <LoadingText value={$data.author.fullName} />
          {:else}
            <p></p>
          {/if}
        </div>
      </div>
      <div class="code" class:highlight={highlightCode}>
        <LoadingText tag="code" value={$data?.code}></LoadingText>
      </div>
    </div>
    <div class="bottom">
      <BookingStatus booking={$data} />
      <div class="date muted">
        <LoadingText value={mapLoading($data?.updatedAt, formatDateTimeSmart)} />
      </div>
      {#if showTicketNames}
        <div class="ticket">
          <LoadingText value={$data?.ticket.name} />
        </div>
      {:else}
        <div class="payment">
          <BookingPaymentMethod booking={$data} />
        </div>
      {/if}
    </div>
  </button>
</li>

<style>
  .booking {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 1rem 1.5rem;
    cursor: pointer;
    border-radius: var(--radius-block);
  }

  .code {
    margin-left: auto;
    font-size: 0.8rem;
    color: var(--bg4);
    text-transform: uppercase;
  }

  @media (max-width: 900px) {
    .booking .desktop-only {
      display: none;
    }

    .bottom {
      justify-content: space-between;
    }
  }

  .top {
    display: flex;
    gap: 1rem;
    align-items: center;
    width: 100%;
  }

  .beneficiary {
    font-size: 1.2em;
  }

  .bottom {
    display: flex;
    gap: 1rem;
    align-items: center;
    width: 100%;
    container: bottom / inline-size;
  }

  @container bottom (min-width: 300px) {
    .booking .payment-method-name {
      display: inline;
    }
  }

  .payment {
    color: var(--shy);
  }

  .author {
    display: flex;
    gap: 0.5em;
    align-items: center;
  }

  .beneficiary,
  .date {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .booking:hover,
  .booking:focus-visible {
    background-color: var(--bg2);
  }

  .code.highlight {
    font-weight: bold;
    color: var(--primary);
  }
</style>
