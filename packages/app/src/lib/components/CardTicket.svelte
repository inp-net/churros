<script lang="ts">
  import {
    fragment,
    graphql,
    type CardTicket,
    type CardTicketDetails,
    type CardTicketPlaces,
  } from '$houdini';
  import IconOpenExternal from '~icons/msl/open-in-new';
  import { AvatarGroup_houdini, AvatarSchool } from '$lib/components';
  import AvatarMajor from '$lib/components/AvatarMajor.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import {
    allLoaded,
    loading,
    mapAllLoading,
    mapLoading,
    onceAllLoaded,
    onceLoaded,
    type MaybeLoading,
  } from '$lib/loading';
  import { route } from '$lib/ROUTES';
  import { formatDistance, isWithinInterval } from 'date-fns';
  import { onMount } from 'svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';

  export let externalURL: MaybeLoading<URL | null> | null = null;

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

  export let details: CardTicketDetails | null = null;
  $: dataDetails = fragment(
    details,
    graphql(`
      fragment CardTicketDetails on Ticket @loading {
        openToGroups {
          ...AvatarGroup
        }
        openToMajors(smart: true) {
          ...AvatarMajor
        }
        openToSchools {
          ...AvatarSchool
        }
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

  $: hasAvatars = $dataDetails
    ? [...$dataDetails.openToSchools, ...$dataDetails.openToGroups, ...$dataDetails.openToMajors]
        .length > 0
    : false;
</script>

<div class="ticket">
  <div class="text">
    <div class="title">
      {#if $dataDetails && hasAvatars}
        <div class="avatars">
          {#each $dataDetails.openToSchools?.filter(Boolean) ?? [] as school}
            <AvatarSchool {school} />
          {/each}
          {#each $dataDetails.openToMajors?.filter(Boolean) ?? [] as major}
            <AvatarMajor {major} />
          {/each}
          {#each $dataDetails.openToGroups?.filter(Boolean) ?? [] as group}
            <AvatarGroup_houdini {group} />
          {/each}
        </div>
      {/if}
      <LoadingText value={$data?.name || 'Place'}>Place</LoadingText>
    </div>
    <div class="subtitle">
      <LoadingText
        value={mapAllLoading(
          [$data?.opensAt, $data?.closesAt, externalURL],
          (start, end, external) => {
            if (external) 
              return `Billetterie externe sur ${external.host}`;
            
            if (!start || !end || !now) return '';
            try {
              return ticketIsOpen
                ? `${formatDistance(end, now)} pour shotgun`
                : `Vente ${formatDistance(start, now, { addSuffix: true })}`;
            } catch (error) {
              console.error({ start, end, now, e: error });
              return '';
            }
          },
        )}>?</LoadingText
      >
    </div>
  </div>
  <div class="actions">
    <ButtonSecondary
      newTab={Boolean(loading(externalURL, null))}
      href={onceLoaded(externalURL, (u) => u?.toString() ?? '', '') ||
        ($data
          ? onceAllLoaded(
              [$data.event.localID, $data.localID],
              (id, ticket) => route('/events/[id]/book/[ticket]', { id, ticket }),
              '',
            )
          : '')}
      >Obtenir {#if externalURL}<IconOpenExternal />{/if}{#if $data}<span class="price"
          ><LoadingText value={mapLoading($data?.price, (p) => `${p}€`)}>...</LoadingText></span
        >{/if}
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
    display: flex;
    column-gap: 1ch;
    align-items: center;
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

  .avatars {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25ch 0.5ch;
    align-items: center;
  }
</style>
