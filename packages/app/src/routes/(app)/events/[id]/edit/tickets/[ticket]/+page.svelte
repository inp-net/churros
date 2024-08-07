<script lang="ts">
  import SubmenuItemBooleanConstraint from './SubmenuItemBooleanConstraint.svelte';
  import type { PageData } from './$houdini';
  import {
    MaybeError,
    Alert,
    ButtonGhost,
    InputToggleTriState,
    ButtonSecondary,
    IconLinkVariant,
    Submenu,
    SubmenuItem,
    InputToggle,
    InputText,
    InputDateTimeRange,
    InputDateTime,
    PickGroup,
    ModalOrDrawer,
  } from '$lib/components';
  import { route } from '$lib/ROUTES';
  import { refroute } from '$lib/navigation';
  import { mutate } from '$lib/mutations';
  import {
    onceLoaded,
    mapLoading,
    LoadingText,
    loading,
    mapAllLoading,
    type MaybeLoading,
    loaded,
  } from '$lib/loading';
  import IconHelp from '~icons/msl/help-outline';
  import IconShotgunOpen from '~icons/msl/lock-open-outline';
  import IconShotgunClose from '~icons/msl/lock-outline';
  import IconPrice from '~icons/msl/euro';
  import IconCapacity from '~icons/msl/file-copy-outline';
  import IconTicketGroup from '~icons/msl/inventory-2-outline';
  import IconContributor from '~icons/msl/contact-emergency-outline';
  import IconGodson from '~icons/msl/hub-outline';
  import IconCheck from '~icons/msl/check';
  import IconDisallow from '~icons/msl/close';
  import IconDontCare from '~icons/msl/skip-next-outline';
  import IconPaymentMethod from '~icons/msl/account-balance-wallet-outline';
  import IconAlumni from '~icons/msl/school-outline';
  import IconStudentOf from '~icons/msl/account-tree-outline';
  import IconGroupMember from '~icons/msl/group-outline';
  import IconPromotion from '~icons/msl/azm-outline';
  import IconManagersOnly from '~icons/msl/shield-outline';
  import IconExternalUser from '~icons/msl/globe';
  import IconApprentice from '~icons/msl/enterprise-outline';
  import { formatDistance, formatDistanceToNow, isBefore } from 'date-fns';
  import {
    LimitToContributors,
    LimitToAlumni,
    LimitToApprentices,
    LimitToExternal,
    LimitToGroupMembers,
    LimitToMajors,
    LimitToManagers,
    LimitToPromotions,
    UpdateCapacity,
    UpdateGodsonLimit,
    UpdateName,
    UpdatePrice,
    UpdateShotgunDates,
  } from './mutations';
  import { toasts } from '$lib/toasts';
  import { PendingValue, type BooleanConstraint$options } from '$houdini';
  import { DISPLAY_BOOLEAN_CONSTRAINT } from '$lib/display';
  import { schoolYearStart } from '$lib/dates';

  export let data: PageData;
  $: ({ PageEventEditTicket } = data);
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons

  let openGodsonHelp: () => void;
</script>

<MaybeError result={$PageEventEditTicket} let:data={{ event }}>
  {#if event.ticket}
    <div class="contents">
      <InputText
        on:blur={async ({ currentTarget }) => {
          if (!(currentTarget instanceof HTMLInputElement)) return;
          if (!event.ticket) return;
          toasts.mutation(
            await mutate(UpdateName, {
              ticket: event.ticket.id,
              name: currentTarget.value,
            }),
            'updateTicket',
            '',
            'Impossible de changer le nom du billet',
          );
        }}
        value={loading(event.ticket.name, '')}
        label="Nom du billet"
        placeholder="Sans nom"
      ></InputText>
      <Submenu>
        <InputDateTimeRange
          style="box"
          resourceId={event.ticket.id}
          start={event.ticket.opensAt}
          end={event.ticket.closesAt}
          on:update={async ({ detail }) => {
            if (!detail) return;
            if (!event.ticket) return;
            toasts.mutation(
              await UpdateShotgunDates.mutate({
                ticket: loading(event.ticket.id, ''),
                shotgun: detail,
              }),
              'updateTicket',
              '',
              'Impossible de mettre à jour les dates du shotgun',
            );
          }}
        >
          <SubmenuItem
            let:value
            let:update
            slot="start"
            icon={IconShotgunOpen}
            subtext={mapAllLoading(
              [event.ticket.opensAt, event.startsAt],
              (shotgun, event) =>
                `${formatDistance(shotgun, event)} ${
                  isBefore(shotgun, event) ? 'avant' : 'après'
                } l'événement`,
            )}
          >
            Début du shotgun
            <InputDateTime on:clear={update} style="box" {value} label="" on:blur={update} />
          </SubmenuItem>
          <SubmenuItem
            let:value
            let:update
            slot="end"
            icon={IconShotgunClose}
            subtext={mapAllLoading(
              [event.ticket.closesAt, event.endsAt],
              (shotgun, event) =>
                `${formatDistance(shotgun, event)} ${
                  isBefore(shotgun, event) ? 'avant' : 'après'
                } l'événement`,
            )}
          >
            Fin du shotgun
            <InputDateTime on:clear={update} style="box" {value} label="" on:blur={update} />
          </SubmenuItem>
        </InputDateTimeRange>
        <SubmenuItem icon={IconPrice} label>
          Prix
          <InputText
            label=""
            inputmode="decimal"
            slot="right"
            value={onceLoaded(event.ticket.basePrice, (x) => x.toString(), '')}
            on:blur={async ({ currentTarget }) => {
              if (!(currentTarget instanceof HTMLInputElement)) return;
              if (!event.ticket) return;
              const coerced = currentTarget.value ? Number.parseFloat(currentTarget.value) : 0;
              if (Number.isNaN(coerced)) {
                toasts.error('Le prix doit être un nombre');
              }
              toasts.mutation(
                await mutate(UpdatePrice, {
                  ticket: event.ticket.id,
                  price: coerced,
                }),
                'updateTicket',
                '',
                'Impossible de changer le prix',
              );
            }}
          />
        </SubmenuItem>
        <SubmenuItem label icon={IconCapacity} subtext="Nombre de places max.">
          Capacité
          <InputText
            label=""
            slot="right"
            clearable
            inputmode="decimal"
            value={onceLoaded(event.ticket.capacity, (x) => x?.toString() ?? '', '')}
            on:blur={async ({ currentTarget }) => {
              if (!event.ticket) return;
              if (!(currentTarget instanceof HTMLInputElement)) return;
              const coerced =
                currentTarget.value === '' ? null : Number.parseInt(currentTarget.value);
              if (coerced !== null && Number.isNaN(coerced)) return;
              toasts.mutation(
                await mutate(UpdateCapacity, {
                  ticket: event.ticket.id,
                  capacity: coerced,
                }),
                'updateTicket',
                '',
                'Impossible de mettre à jour la capacité',
              );
            }}
          />
        </SubmenuItem>
        <SubmenuItem
          subtext="Accessibles après réservation de ce billet"
          chevron
          href={route('/events/[id]/edit/tickets/[ticket]/links', {
            id: loading(event.localID, ''),
            ticket: loading(event.ticket.localID ?? '', ''),
          })}
          icon={IconLinkVariant}
        >
          Liens, formulaires
        </SubmenuItem>
        <SubmenuItem
          icon={IconTicketGroup}
          subtext={event.ticket.group?.name ?? 'Aucun groupe'}
          clickable
          on:click={() => alert('TODO')}>Groupe de billet</SubmenuItem
        >
        <ModalOrDrawer bind:open={openGodsonHelp}>
          <h1 slot="header">Parrainages</h1>
          <p>
            Churros te permet de faire des billets avec parrainages: une personne qui a accès à ce
            billet pourra en acheter jusqu'à un certain nombre pour d'autres (par exemple, des
            ami·e·s), peut importe si ces autres personnes ont accès au billet ou pas.
          </p>
        </ModalOrDrawer>
        <SubmenuItem icon={IconGodson} label subtext="Limite par personne">
          Parrainages <ButtonGhost on:click={openGodsonHelp}><IconHelp /></ButtonGhost>
          <InputText
            slot="right"
            clearable
            placeholder="0 (Désactivé)"
            label=""
            inputmode="decimal"
            value={onceLoaded(event.ticket.godsonLimit, (x) => x.toString() || '', '')}
            on:blur={async ({ currentTarget }) => {
              if (!event.ticket) return;
              if (!(currentTarget instanceof HTMLInputElement)) return;
              const coerced = currentTarget.value === '' ? 0 : Number.parseInt(currentTarget.value);
              if (Number.isNaN(coerced)) return;
              toasts.mutation(
                await mutate(UpdateGodsonLimit, {
                  ticket: event.ticket.id,
                  godsonLimit: coerced,
                }),
                'updateTicket',
                '',
                'Impossible de mettre à jour la limite de parrainages',
              );
            }}
          ></InputText>
        </SubmenuItem>
      </Submenu>
      <section class="constraints">
        <header>
          <h2 class="typo-field-label">Contraintes</h2>
          <p class="muted typo-details">
            Pour qu'une personne puisse réserver une place, l'ensemble des contraintes définies
            ci-dessous doivent être toutes remplies
          </p>
        </header>
        <Submenu>
          <SubmenuItem
            icon={IconManagersOnly}
            label
            subtext={mapLoading(event.ticket.onlyManagersCanProvide, (only) =>
              only ? 'Uniquement les managers peuvent réserver des places sur ce billet' : 'Non',
            )}
          >
            Managers seulement
            <InputToggle
              value={event.ticket.onlyManagersCanProvide}
              on:update={async ({ detail }) => {
                if (!event.ticket) return;
                toasts.mutation(
                  await mutate(LimitToManagers, {
                    ticket: event.ticket.id,
                    activated: detail,
                  }),
                  'updateTicketConstraints',
                  '',
                  'Impossible de changer la contrainte sur les managers',
                );
              }}
            ></InputToggle>
          </SubmenuItem>
          <SubmenuItemBooleanConstraint
            ticketId={event.ticket.id}
            mutation={LimitToContributors}
            errorMessage="Impossible de changer la contrainte de cotisation"
            value={event.ticket.openToContributors}
            icon={IconContributor}
            subtext={mapLoading(
              event.organizer.studentAssociation.name,
              (name) => `Cotisant·e·s de ${name}`,
            )}
          >
            Cotisant·e·s
          </SubmenuItemBooleanConstraint>
          <SubmenuItemBooleanConstraint
            ticketId={event.ticket.id}
            mutation={LimitToAlumni}
            errorMessage="Impossible de changer la contrainte sur les alumnis"
            value={event.ticket.openToAlumni}
            icon={IconAlumni}
            subtext="Promos inférieures à {schoolYearStart().getFullYear() - 3}"
          >
            Alumnis
          </SubmenuItemBooleanConstraint>
          <SubmenuItemBooleanConstraint
            ticketId={event.ticket.id}
            mutation={LimitToApprentices}
            errorMessage="Impossible de changer la contrainte sur les apprentis"
            value={event.ticket.openToApprentices}
            icon={IconApprentice}
            subtext="FISAs"
          >
            Apprenti·e·s
          </SubmenuItemBooleanConstraint>
          <SubmenuItemBooleanConstraint
            ticketId={event.ticket.id}
            mutation={LimitToExternal}
            errorMessage="Impossible de changer la contrainte sur les extés"
            value={event.ticket.openToExternal}
            icon={IconExternalUser}
            subtext="Personnes extérieures à l'école"
          >
            Externe·s
          </SubmenuItemBooleanConstraint>
        </Submenu>
      </section>
    </div>
  {:else}
    <Alert theme="danger">
      <p>Billet non trouvé</p>
    </Alert>
  {/if}
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  .constraints {
    margin-top: 2rem;
  }

  .constraints header {
    --weight-field-label: 900;
    margin-bottom: 1rem;
  }

  .constraints p.muted {
    font-weight: normal;
    line-height: 1.1;
    margin-top: 0.5rem;
  }
</style>
