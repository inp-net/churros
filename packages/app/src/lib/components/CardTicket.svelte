<script lang="ts">
  import { page } from '$app/stores';
  import IconLockOpen from '~icons/msl/lock-open-outline';
  import {
    fragment,
    graphql,
    type CardTicket,
    type CardTicketDetails,
    type CardTicketPlaces,
  } from '$houdini';
  import AvatarGroup from '$lib/components/AvatarGroup.houdini.svelte';
  import AvatarMajor from '$lib/components/AvatarMajor.svelte';
  import AvatarSchool from '$lib/components/AvatarSchool.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import {
    allLoaded,
    loaded,
    loading,
    mapAllLoading,
    onceAllLoaded,
    onceLoaded,
    type MaybeLoading,
  } from '$lib/loading';
  import { refroute } from '$lib/navigation';
  import { formatDistance, isWithinInterval } from 'date-fns';
  import { createEventDispatcher, onMount } from 'svelte';
  import IconOpenExternal from '~icons/msl/open-in-new';
  import IconInvited from '~icons/msl/link';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';

  const dispatch = createEventDispatcher<{ book: string }>();
  let openCanSeePlacesBcauseManagerExplainer: () => void;

  export let externalURL: MaybeLoading<URL | null> | null = null;

  export let highlighted = false;

  export let places: CardTicketPlaces | null = null;
  $: dataPlaces = fragment(
    places,
    graphql(`
      fragment CardTicketPlaces on Ticket @loading {
        placesLeft
        capacity
        event {
          showPlacesLeft
          showCapacity
        }
      }
    `),
  );

  export let details: CardTicketDetails | null = null;
  $: dataDetails = fragment(
    details,
    graphql(`
      fragment CardTicketDetails on Ticket @loading {
        invited
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
        minimumPrice(applyPromotions: true)
        priceIsVariable
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

  /** Used to show an icon saying that the user can see an information because they have some rights */
  $: canSeePlacesBecauseManager =
    $dataPlaces &&
    onceAllLoaded(
      [$dataPlaces],
      ({ placesLeft, capacity, event: { showCapacity, showPlacesLeft } }) => {
        if (showCapacity && placesLeft === 'Unlimited') return false;
        return (placesLeft !== null && !showPlacesLeft) || (capacity !== null && !showCapacity);
      },
      false,
    );

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

<div class="ticket" class:highlighted class:invited={loading($dataDetails?.invited, false)}>
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
            <AvatarGroup {group} />
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
            if (external) return `Billetterie externe sur ${external.host}`;

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
      {#if loading($dataDetails?.invited, false)}
        <svelte:element this={highlighted ? 'span' : 'em'} class="invited">
          · <IconInvited /> visible par invitation
        </svelte:element>
      {/if}
    </div>
  </div>
  <div class="actions">
    <ButtonSecondary
      newTab={Boolean(loading(externalURL, null))}
      href={onceLoaded(externalURL, (u) => u?.toString() ?? '', '') ||
      ($data && $page.route.id !== '/(app)/events/[id]')
        ? onceAllLoaded(
            [$data?.event.localID, $data?.localID],
            (event, ticket) => `${refroute('/events/[id]', event)}#book/${ticket}`,
            '',
          )
        : undefined}
      on:click={!onceLoaded(externalURL, Boolean, null) && $page.route.id === '/(app)/events/[id]'
        ? () => {
            if (!$data || !loaded($data.localID)) return;
            dispatch('book', $data.localID);
          }
        : undefined}
      >Obtenir {#if externalURL}<IconOpenExternal />{/if}{#if $data}<span class="price"
          ><LoadingText
            value={mapAllLoading(
              [$data?.minimumPrice, $data?.priceIsVariable],
              (min, variable) => `${variable ? '⩾' : ''}${min}€`,
            )}>...</LoadingText
          ></span
        >{/if}
    </ButtonSecondary>
    {#if $dataPlaces}
      <div class="places">
        {#if !allLoaded($dataPlaces)}
          <LoadingText>... places / ...</LoadingText>
        {:else if $dataPlaces.placesLeft === 'Unlimited' || $dataPlaces.capacity === 'Unlimited'}
          Places illimitées
        {:else if $dataPlaces.placesLeft}
          {$dataPlaces.placesLeft} places {#if $dataPlaces.capacity}
            / {$dataPlaces.capacity}{:else}
            restantes{/if}
        {:else if $dataPlaces.capacity}
          {$dataPlaces.capacity} places au total
        {/if}
        {#if canSeePlacesBecauseManager}
          <ModalOrDrawer
            narrow
            notrigger
            bind:open={openCanSeePlacesBcauseManagerExplainer}
            title="Visibilité du nombre de places"
          >
            <p>
              Tu peux voir le nombre de places {#if loading($dataPlaces.event.showCapacity, null)}restantes{/if}
              parce que tu es manager de l'évènement
            </p>
          </ModalOrDrawer>
          <ButtonGhost
            inline
            on:click={openCanSeePlacesBcauseManagerExplainer}
            help="Tu peux voir le nombre de places {loading($dataPlaces.event.showCapacity, null)
              ? 'restantes'
              : ''} parce que tu es manager de l'évènement"
          >
            <IconLockOpen />
          </ButtonGhost>
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

  .ticket.highlighted {
    color: var(--highlight-fg, var(--primary));
    background-color: var(--highlight, var(--primary-bg));
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
