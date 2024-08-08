<script lang="ts">
  import { fragment, graphql, type CardTicket, type CardTicketPlaces } from '$houdini';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { mapAllLoading, mapLoading, onceAllLoaded, allLoaded } from '$lib/loading';
  import { route } from '$lib/ROUTES';
  import { formatDistance, isWithinInterval } from 'date-fns';
  import { onMount } from 'svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';

  export let places: CardTicketPlaces | null = null;
  $: dataPlaces = fragment(
    places,
    graphql(`
      fragment CardTicketPlaces on Ticket @loading {
        placesLeft
        capacity
      }
    `),
  );

  export let ticket: CardTicket | null;
  $: data = fragment(
    ticket,
    graphql(`
      fragment CardTicket on Ticket @loading {
        localID
        opensAt
        closesAt
        name
        price
        event {
          localID
        }
      }
    `),
  );

  let now = new Date();
  onMount(() => {
    setInterval(() => {
      now = new Date();
    }, 500);
  });

  $: ticketIsOpen =
    $data &&
    mapAllLoading(
      [$data.opensAt, $data.closesAt],
      (start, end) => start && end && isWithinInterval(now, { start, end }),
    );
</script>

<div class="ticket">
  <div class="text">
    <div class="title">
      <LoadingText value={$data?.name || "Place"}>Place</LoadingText>
    </div>
    <div class="subtitle">
      <LoadingText
        value={mapAllLoading([$data?.opensAt, $data?.closesAt], (start, end) =>
          ticketIsOpen && start && end
            ? `${formatDistance(end, now)} pour shotgun`
            : `Vente ${formatDistance(start, now, { addSuffix: true })}`,
        )}>?</LoadingText
      >
    </div>
  </div>
  <div class="actions">
    <ButtonSecondary
      href={$data
        ? onceAllLoaded(
            [$data.event.localID, $data.localID],
            (id, ticket) => route('/events/[id]/book/[ticket]', { id, ticket }),
            '',
          )
        : ''}
      >Obtenir <span class="price"
        ><LoadingText value={mapLoading($data?.price, (p) => `${p}€`)}>...</LoadingText></span
      >
    </ButtonSecondary>
    {#if $dataPlaces}
      <div class="places">
        {#if !allLoaded($dataPlaces)}
          <LoadingText>... places / ...</LoadingText>
        {:else if $dataPlaces.placesLeft}
          {$dataPlaces.placesLeft} places / {$dataPlaces.capacity}
        {:else}
          {$dataPlaces.capacity} places au total
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .ticket {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    color: var(--color);
    background-color: var(--background, var(--bg2));
    border: var(--border-block) solid var(--color, transparent);
    border-radius: 10px;
  }

  /* .ticket .price {
    color: var(--color, var(--shy));
  } */

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

  .ticket .places {
    margin-top: 0.25em;
    font-size: 0.8rem;
    text-align: right;
  }
</style>
