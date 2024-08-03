<script lang="ts">
  import AvatarGroup from '$lib/components/AvatarGroup.houdini.svelte';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import IconLinkVariant from '$lib/components/IconLinkVariant.svelte';
  import InputTextGhost from '$lib/components/InputTextGhost.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import TextEventDates from '$lib/components/TextEventDates.svelte';
  import { DISPLAY_EVENT_FREQUENCY, HELP_VISIBILITY } from '$lib/display';
  import { sentenceJoin } from '$lib/i18n';
  import { loaded, mapAllLoading, mapLoading } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { toasts } from '$lib/toasts';
  import IconBannedUsers from '~icons/msl/account-circle-off-outline';
  import IconRecurrence from '~icons/msl/calendar-month-outline';
  import IconDates from '~icons/msl/calendar-today-outline';
  import IconDescription from '~icons/msl/format-align-left';
  import IconCoOrgnizers from '~icons/msl/group-work-outline';
  import IconImage from '~icons/msl/image-outline';
  import IconLocation from '~icons/msl/location-on-outline';
  import IconContact from '~icons/msl/mail-outline';
  import IconTickets from '~icons/msl/receipt-long-outline';
  import IconManagers from '~icons/msl/supervised-user-circle-outline';
  import IconVisibility from '~icons/msl/visibility-outline';
  import type { LayoutData, LayoutRouteId } from './$houdini';
  import ModalDelete from './ModalDelete.svelte';
  import { ChangeEventLocation, ChangeEventTitle } from './mutations';
  import { page } from '$app/stores';

  export let data: LayoutData;

  $: leftSplitShownOnMobile = $page.route.id === ('/(app)/events/[id]/edit' as LayoutRouteId);

  $: ({ LayoutEventEdit } = data);
</script>

<div class="split">
  <div class="left" class:mobile-shown={leftSplitShownOnMobile}>
    <MaybeError result={$LayoutEventEdit} let:data={{ event }}>
      <ModalDelete eventId={event.id} />
      <section class="basic-info">
        <div class="avatar">
          <AvatarGroup group={event.organizer} />
        </div>
        <div class="inputs">
          <div class="group">
            Par <LoadingText value={event.organizer.name}></LoadingText>
            <ButtonInk
              insideProse
              on:click={() => {
                alert('todo');
              }}>Changer</ButtonInk
            >
          </div>
          <div class="title">
            <InputTextGhost
              value={event.title}
              placeholder="Ajouter un titre…"
              label="Titre de l'évènement"
              on:blur={async ({ detail }) => {
                const result = await mutate(ChangeEventTitle, { event: event.id, title: detail });
                if (result)
                  toasts.mutation(result, 'updateEvent', '', 'Impossible de changer le titre');
              }}
            />
          </div>
          <div class="dates">
            <IconDates />
            <div
              class="dates-value"
              class:muted={loaded(event.startsAt) &&
                loaded(event.endsAt) &&
                (!event.startsAt || !event.endsAt)}
            >
              {#if loaded(event.startsAt) && loaded(event.endsAt)}
                <TextEventDates {event} defaultText="Préciser les dates…" />
              {:else}
                <LoadingText value="Chargement des dates…"></LoadingText>
              {/if}
            </div>
          </div>
          <div class="location">
            <IconLocation />
            <InputTextGhost
              value={event.location}
              placeholder="Ajouter un lieu…"
              label="Lieu de l'évènement"
              on:blur={async ({ detail }) => {
                const result = await mutate(ChangeEventLocation, {
                  event: event.id,
                  location: detail,
                });
                if (result)
                  toasts.mutation(result, 'updateEvent', '', 'Impossible de changer le lieu');
              }}
            />
          </div>
        </div>
      </section>
      <Submenu>
        <SubmenuItem
          icon={IconVisibility}
          href="./visibility"
          subtext={mapAllLoading(
            [event.visibility, event.includeInKiosk],
            (vis, kiosk) =>
              `${HELP_VISIBILITY[vis]}, ${kiosk ? `inclus dans` : 'exclus du'} mode kioske`,
          )}
        >
          Visibilité
        </SubmenuItem>
        <SubmenuItem icon={IconLinkVariant} href="./links">Liens</SubmenuItem>
        <SubmenuItem icon={IconDescription} href="./description">Description</SubmenuItem>
        <SubmenuItem icon={IconImage} href="./image">Image de fond</SubmenuItem>
        <SubmenuItem
          icon={IconCoOrgnizers}
          clickable
          subtext={mapAllLoading(
            event.coOrganizers.map((o) => o.name),
            (...names) => sentenceJoin(names),
          )}
          on:click={() => {
            alert('todo');
          }}
        >
          Co-organisateurs
          <div class="organizers-avatars" slot="right">
            {#each event.coOrganizers as coOrganizer}
              <AvatarGroup group={coOrganizer} />
            {/each}
          </div>
        </SubmenuItem>
        <SubmenuItem icon={IconTickets} href="./ticketing">Billetterie</SubmenuItem>
        <SubmenuItem
          icon={IconRecurrence}
          href="./recurrence"
          subtext={mapLoading(event.frequency, (freq) => DISPLAY_EVENT_FREQUENCY[freq])}
          >Récurrence</SubmenuItem
        >
        <SubmenuItem icon={IconContact} href="./contact">Contact de l'orga</SubmenuItem>
        <SubmenuItem icon={IconManagers} href="./managers">Managers</SubmenuItem>
        <SubmenuItem icon={IconBannedUsers} href="./banned">Banni·e·s</SubmenuItem>
      </Submenu>
    </MaybeError>
  </div>
  <div class="right" class:mobile-shown={!leftSplitShownOnMobile}>
    <slot></slot>
  </div>
</div>

<style>
  @media (min-width: 1400px) {
    :global(#layout[data-route^='/(app)/events/[id]/edit']) {
      --scrollable-content-width: calc(clamp(1000px, 100vw - 400px, 1200px));
    }

    .split {
      position: relative;
      display: grid;
      grid-template-columns: 1fr 2fr;
    }

    .left {
      position: sticky;
      top: 0;
    }
  }

  @media (max-width: 1400px) {
    .split {
      display: grid;
      grid-template-columns: 1fr;
    }

    .split > div:not(.mobile-shown) {
      display: none;
    }
  }

  .basic-info {
    display: flex;
    gap: 1rem;
    padding: 0 1rem;
    margin-bottom: 2rem;
  }

  .avatar {
    --avatar-size: 3rem;
  }

  .inputs {
    display: flex;
    flex-direction: column;
  }

  .title {
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  .dates,
  .location {
    display: flex;
    column-gap: 0.5ch;
    align-items: center;
  }
</style>
