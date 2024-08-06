<script lang="ts">
  import { page } from '$app/stores';
  import { PickGroup } from '$lib/components';
  import AvatarGroup from '$lib/components/AvatarGroup.houdini.svelte';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import IconLinkVariant from '$lib/components/IconLinkVariant.svelte';
  import InputDateTime from '$lib/components/InputDateTime.svelte';
  import InputDateTimeRange from '$lib/components/InputDateTimeRange.svelte';
  import InputTextGhost from '$lib/components/InputTextGhost.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { formatDate } from '$lib/dates';
  import { DISPLAY_EVENT_FREQUENCY, DISPLAY_VISIBILITIES } from '$lib/display';
  import { sentenceJoin } from '$lib/i18n';
  import { allLoaded, loaded, loading, mapAllLoading } from '$lib/loading';
  import { isMobile } from '$lib/mobile';
  import { mutate } from '$lib/mutations';
  import { route } from '$lib/ROUTES';
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
  import {
    ChangeEventCoOrganizers,
    ChangeEventDates,
    ChangeEventLocation,
    ChangeEventOrganizer,
    ChangeEventTitle,
  } from './mutations';

  const mobile = isMobile();

  export let data: LayoutData;

  $: leftSplitShownOnMobile =
    $page.route.id === ('/(app)/events/[id]/edit' as LayoutRouteId) || layoutErrored;

  $: ({ LayoutEventEdit } = data);

  let layoutErrored = false;

  let updatedDates:
    | {
        start: Date | null;
        end: Date | null;
      }
    | undefined;
  let resetStartsAtInput: () => void;
  let resetEndsAtInput: () => void;

  $: if (!updatedDates && $LayoutEventEdit.data?.event && allLoaded($LayoutEventEdit.data.event)) {
    updatedDates = {
      start: $LayoutEventEdit.data.event.startsAt,
      end: $LayoutEventEdit.data.event.endsAt,
    };
  }

  let splitElement: HTMLDivElement;
  $: if (splitElement) {
    splitElement.style.setProperty(
      '--distance-to-top',
      `${splitElement.getBoundingClientRect().top}px`,
    );
  }
</script>

<div class="split" bind:this={splitElement}>
  <div class="left" class:mobile-shown={leftSplitShownOnMobile}>
    <MaybeError
      bind:errored={layoutErrored}
      result={$LayoutEventEdit}
      let:data={{ event, me, allGroups }}
    >
      <ModalDelete eventId={event.id} />
      <section class="basic-info" class:mobile>
        <div class="avatar">
          <AvatarGroup group={event.organizer} />
        </div>
        <div class="inputs">
          <div class="group">
            Par <LoadingText value={event.organizer.name}></LoadingText>
            <PickGroup
              title="Organisateur"
              value={event.organizer.uid}
              options={me?.canCreateEventsOn ?? []}
              let:open
              on:finish={async ({ detail: newGroupUid }) => {
                const result = await mutate(ChangeEventOrganizer, {
                  event: event.id,
                  group: newGroupUid,
                });
                toasts.mutation(
                  result,
                  'changeEventOrganizer',
                  `${newGroupUid} est maintenant l'organisateur principal`,
                  "Impossible de changer l'organisateur",
                );
              }}
            >
              <ButtonInk insideProse on:click={open}>Changer</ButtonInk>
            </PickGroup>
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
            <div class="icon">
              <IconDates />
            </div>
            <div
              class="dates-value"
              class:muted={loaded(event.startsAt) &&
                loaded(event.endsAt) &&
                (!event.startsAt || !event.endsAt)}
            >
              {#if loaded(event.startsAt) && loaded(event.endsAt)}
                <!-- <TextEventDates {event} defaultText="Préciser les dates…" /> -->
                <InputDateTimeRange
                  resourceId={event.id}
                  start={event.startsAt}
                  end={event.endsAt}
                  on:update={async ({ detail: dates }) => {
                    if (!loaded(event.id)) return;
                    const result = await ChangeEventDates.mutate({ event: event.id, dates });
                    if (
                      !toasts.mutation(
                        result,
                        'setEventDates',
                        '',
                        'Impossible de changer les dates',
                      )
                    ) {
                      resetStartsAtInput?.();
                      resetEndsAtInput?.();
                    }
                  }}
                >
                  <div class="start" slot="start" let:update let:value>
                    du
                    <InputDateTime
                      {value}
                      on:blur={update}
                      on:clear={update}
                      bind:reset={resetStartsAtInput}
                      label=""
                    ></InputDateTime>
                  </div>
                  <div class="end" slot="end" let:update let:value>
                    au
                    <InputDateTime
                      {value}
                      on:blur={update}
                      on:clear={update}
                      bind:reset={resetEndsAtInput}
                      label=""
                    ></InputDateTime>
                  </div>
                </InputDateTimeRange>
              {:else}
                <LoadingText value="Chargement des dates…"></LoadingText>
              {/if}
            </div>
          </div>
          <div class="location">
            <div class="icon">
              <IconLocation />
            </div>
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
          href={route('/events/[id]/edit/visibility', loading(event.localID, ''))}
          subtext={mapAllLoading(
            [event.visibility, event.includeInKiosk],
            (vis, kiosk) => `${DISPLAY_VISIBILITIES[vis]}${kiosk ? `` : ', exclus du mode kioske'}`,
          )}
        >
          Visibilité
        </SubmenuItem>
        <SubmenuItem
          icon={IconLinkVariant}
          href={route('/events/[id]/edit/links', loading(event.localID, ''))}
        >
          Liens
        </SubmenuItem>
        <SubmenuItem
          icon={IconDescription}
          href={route('/events/[id]/edit/description', loading(event.localID, ''))}
        >
          Description
        </SubmenuItem>
        <SubmenuItem
          icon={IconImage}
          href={route('/events/[id]/edit/image', loading(event.localID, ''))}
        >
          Image de fond
        </SubmenuItem>
        <PickGroup
          multiple
          options={allGroups}
          title="Co-organisateurs"
          value={mapAllLoading(
            [event.organizer.uid, ...event.coOrganizers.map((o) => o.uid)],
            (orga, ...x) => x.filter((x) => x !== orga),
          )}
          on:finish={async ({ detail }) => {
            const result = await mutate(ChangeEventCoOrganizers, {
              event: event.id,
              coOrganizers: detail,
            });
            toasts.mutation(
              result,
              'setEventCoOrganizers',
              '',
              'Impossible de changer les co-organisateurs',
            );
          }}
          let:open
        >
          <SubmenuItem
            icon={IconCoOrgnizers}
            clickable
            subtext={mapAllLoading(
              event.coOrganizers.map((o) => o.name),
              (...names) => sentenceJoin(names),
            )}
            on:click={open}
            >Co-organisateurs
            <div class="organizers-avatars" slot="right">
              {#each event.coOrganizers.slice(0, 4) as coOrganizer}
                <AvatarGroup href="" group={coOrganizer} />
              {/each}
              {#if event.coOrganizers.length > 4}
                <span>+{event.coOrganizers.length - 4}</span>
              {/if}
            </div>
          </SubmenuItem>
        </PickGroup>
        <SubmenuItem
          icon={IconTickets}
          href={route('/events/[id]/edit/ticketing', loading(event.localID, ''))}
        >
          Billetterie
        </SubmenuItem>
        <SubmenuItem
          icon={IconRecurrence}
          href={route('/events/[id]/edit/recurrence', loading(event.localID, ''))}
          subtext={mapAllLoading(
            [event.frequency, event.recurringUntil],
            (freq, recu) =>
              `${DISPLAY_EVENT_FREQUENCY[freq]}${recu ? `, jusqu'au ${formatDate(recu)}` : ''}`,
          )}
        >
          Récurrence
        </SubmenuItem>
        <SubmenuItem
          icon={IconContact}
          subtext={event.contactMail}
          href={route('/events/[id]/edit/contact', loading(event.localID, ''))}
        >
          Contact de l'orga
        </SubmenuItem>
        <SubmenuItem
          icon={IconManagers}
          subtext="Qui peut voir les résas, scanner des billets, modifier l'évènement…"
          href={route('/events/[id]/edit/managers', loading(event.localID, ''))}
        >
          Managers
        </SubmenuItem>
        <SubmenuItem
          icon={IconBannedUsers}
          subtext="Empêcher des personnes de prendre des places ou d'en bénéficier"
          href={route('/events/[id]/edit/banned', loading(event.localID, ''))}
        >
          Banni·e·s
        </SubmenuItem>
      </Submenu>
    </MaybeError>
  </div>
  <div class="right" class:mobile-shown={!leftSplitShownOnMobile}>
    {#if !layoutErrored}
      <slot></slot>
    {/if}
  </div>
</div>

<style>
  @media (min-width: 1400px) {
    :global(body[data-route^='/(app)/events/[id]/edit'] #layout) {
      --scrollable-content-width: calc(clamp(1000px, 100vw - 400px, 1200px));
    }

    /* XXX: If a page in /(app)/events/[id]/edit resets or changes the layout (with +page@...svelte) this will break scrolling */
    :global(body[data-route^='/(app)/events/[id]/edit']) {
      overflow: hidden;
    }

    .split {
      --gap: 3rem;

      position: relative;
      display: grid;
      grid-template-columns: 40% calc(60% - var(--gap));
      column-gap: var(--gap);
    }

    .left {
      height: calc(100vh - 1rem - var(--distance-to-top));
      overflow: hidden auto;
      scrollbar-width: thin;
    }

    .right {
      height: calc(100vh - 1rem - var(--distance-to-top));
      overflow: hidden auto;
      scrollbar-width: thin;
    }
  }

  @media (max-width: 1400px) {
    .split {
      display: grid;
      grid-template-columns: 100%;
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

  .basic-info.mobile {
    /* Devices with on-screen keyboards need a larger empty area to easily dismiss the keyboard after entering a value */
    margin-bottom: 5rem;
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
  }

  :is(.dates, .location) .icon {
    display: flex;
    justify-content: center;
    margin-top: 2px;
  }

  .dates :is(.start, .end) {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .organizers-avatars {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-right: 0.5em;
  }
</style>
