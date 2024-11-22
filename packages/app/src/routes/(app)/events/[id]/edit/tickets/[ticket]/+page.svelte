<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import Alert from '$lib/components/Alert.svelte';
  import AvatarGroup from '$lib/components/AvatarGroup.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import IconLinkVariant from '$lib/components/IconLinkVariant.svelte';
  import InputCheckboxes from '$lib/components/InputCheckboxes.svelte';
  import InputDateTime from '$lib/components/InputDateTime.svelte';
  import InputDateTimeRange from '$lib/components/InputDateTimeRange.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import InputToggle from '$lib/components/InputToggle.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import PickGroup from '$lib/components/PickGroup.svelte';
  import PickMajor from '$lib/components/PickMajor.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { fromYearTier } from '$lib/dates';
  import {
    DISPLAY_PAYMENT_METHODS,
    DISPLAY_TICKET_COUNTING_POLICY,
    stringifyCapacity,
  } from '$lib/display';
  import { sentenceJoin } from '$lib/i18n';
  import {
    loaded,
    loading,
    LoadingText,
    mapAllLoading,
    mapLoading,
    onceAllLoaded,
    onceLoaded,
  } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { route } from '$lib/ROUTES';
  import { toasts } from '$lib/toasts';
  import { tooltip } from '$lib/tooltip';
  import { formatDistance, isBefore } from 'date-fns';
  import IconPaymentMethod from '~icons/msl/account-balance-wallet-outline';
  import IconStudentOf from '~icons/msl/account-tree-outline';
  import IconPromotion from '~icons/msl/azm-outline';
  import IconContributor from '~icons/msl/contact-emergency-outline';
  import IconApprentice from '~icons/msl/enterprise-outline';
  import IconPrice from '~icons/msl/euro';
  import IconCapacity from '~icons/msl/file-copy-outline';
  import IconExternalUser from '~icons/msl/globe';
  import IconCountingPolicy from '~icons/msl/toll-outline';
  import IconGroupMember from '~icons/msl/group-outline';
  import IconHelp from '~icons/msl/help-outline';
  import IconGodson from '~icons/msl/hub-outline';
  import IconTicketGroup from '~icons/msl/inventory-2-outline';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import IconHeart from '~icons/msl/favorite-outline';
  import IconShotgunOpen from '~icons/msl/lock-open-outline';
  import IconShotgunClose from '~icons/msl/lock-outline';
  import IconAlumni from '~icons/msl/school-outline';
  import IconManagersOnly from '~icons/msl/shield-outline';
  import IconWarning from '~icons/msl/warning-outline';
  import type { PageData } from './$houdini';
  import ModalDelete from './ModalDelete.svelte';
  import {
    LimitToAlumni,
    LimitToApprentices,
    LimitToContributors,
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
  import SubmenuItemBooleanConstraint from './SubmenuItemBooleanConstraint.svelte';

  export let data: PageData;
  $: ({ PageEventEditTicket } = data);

  let priceIsVariable = false;
  $: priceIsVariable = loading($PageEventEditTicket?.data?.event.ticket?.priceIsVariable, false);

  let openGodsonHelp: () => void;

  $: ticketName = loading($PageEventEditTicket?.data?.event.ticket?.name, '');
  $: if (ticketName && browser) {
    window.dispatchEvent(
      new CustomEvent('NAVTOP_UPDATE_TITLE', { detail: `Billet ${ticketName}` }),
    );
  }

  let openDeleteModal: () => void;
</script>

<ModalDelete bind:open={openDeleteModal} ticketId={$page.params.ticket} />

<MaybeError result={$PageEventEditTicket} let:data={{ event, groups, majors }}>
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
          variant="box"
          resourceId={event.ticket.id}
          start={event.ticket.opensAt}
          end={event.ticket.closesAt}
          on:update={async ({ detail }) => {
            if (!detail) return;
            if (!event.ticket) return;
            if (!loaded(event.ticket.id)) return;
            toasts.mutation(
              await UpdateShotgunDates.mutate({
                ticket: event.ticket.id,
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
            <InputDateTime on:clear={update} variant="box" {value} label="" on:blur={update} />
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
            <InputDateTime on:clear={update} variant="box" {value} label="" on:blur={update} />
          </SubmenuItem>
        </InputDateTimeRange>
        <SubmenuItem icon={IconPrice} label>
          {#if priceIsVariable}
            Prix minimum
          {:else}
            Prix
          {/if}
          <InputText
            label=""
            inputmode="decimal"
            slot="right"
            value={onceLoaded(event.ticket.minimumPrice, (x) => x.toString(), '')}
            on:blur={async ({ currentTarget }) => {
              if (!(currentTarget instanceof HTMLInputElement)) return;
              if (!event.ticket) return;
              const coerced = currentTarget.value ? Number.parseFloat(currentTarget.value) : 0;
              if (Number.isNaN(coerced)) toasts.error('Le prix doit être un nombre');

              toasts.mutation(
                await mutate(UpdatePrice, {
                  ticket: event.ticket.id,
                  [priceIsVariable ? 'minimumPrice' : 'price']: coerced,
                }),
                'updateTicket',
                '',
                'Impossible de changer le prix',
              );
            }}
          />
        </SubmenuItem>
        <SubmenuItem icon={IconHeart} subtext="Permettre de payer plus" label={!priceIsVariable}>
          {#if priceIsVariable}
            Prix maximum
          {:else}
            Cotisation solidaire
          {/if}
          <div class="max-price" slot="right">
            {#if priceIsVariable}
              <InputText
                label=""
                inputmode="decimal"
                slot="right"
                value={onceLoaded(event.ticket.maximumPrice, (x) => x.toString(), '')}
                on:blur={async ({ currentTarget }) => {
                  if (!(currentTarget instanceof HTMLInputElement)) return;
                  if (!event.ticket) return;
                  const coerced = currentTarget.value ? Number.parseFloat(currentTarget.value) : 0;
                  if (Number.isNaN(coerced)) toasts.error('Le prix doit être un nombre');

                  toasts.mutation(
                    await mutate(UpdatePrice, {
                      ticket: event.ticket.id,
                      maximumPrice: coerced,
                    }),
                    'updateTicket',
                    '',
                    'Impossible de changer le prix maximal',
                  );
                }}
              />
              <p class="typo-details">
                <ButtonInk
                  insideProse
                  on:click={async () => {
                    priceIsVariable = false;
                    if (!event.ticket) return;
                    await mutate(UpdatePrice, {
                      ticket: event.ticket.id,
                      maximumPrice: event.ticket.minimumPrice,
                    });
                  }}>Désactiver</ButtonInk
                >
              </p>
            {:else}
              <InputCheckbox label="" value={false} on:change={() => (priceIsVariable = true)}
              ></InputCheckbox>
            {/if}
          </div>
        </SubmenuItem>
        <SubmenuItem label icon={IconCapacity} subtext="Nombre de places max.">
          Capacité
          <InputText
            label=""
            slot="right"
            clearable
            inputmode="decimal"
            value={onceLoaded(event.ticket.capacity, stringifyCapacity, '')}
            on:blur={async ({ currentTarget }) => {
              if (!event.ticket) return;
              if (!(currentTarget instanceof HTMLInputElement)) return;
              const coerced =
                currentTarget.value === '' ? null : Number.parseInt(currentTarget.value);
              if (coerced !== null && Number.isNaN(coerced)) return;
              toasts.mutation(
                await mutate(UpdateCapacity, {
                  ticket: event.ticket.id,
                  capacity: coerced ?? 'Unlimited',
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
        <!-- <SubmenuItem
          icon={IconTicketGroup}
          subtext={event.ticket.group?.name ?? 'Aucun groupe'}
          clickable
          on:click={() => alert('TODO')}>Groupe de billet</SubmenuItem
        > -->
        <ModalOrDrawer bind:open={openGodsonHelp} notrigger>
          <h1 slot="header">Parrainages</h1>
          <p>
            Churros te permet de faire des billets avec parrainages: une personne qui a accès à ce
            billet pourra en acheter jusqu'à un certain nombre pour d'autres (par exemple, des
            ami·e·s), peut importe si ces autres personnes ont accès au billet ou pas.
          </p>
        </ModalOrDrawer>
        <SubmenuItem icon={IconGodson} label subtext="Limite par personne">
          <div class="side-by-side">
            Parrainages <ButtonGhost on:click={openGodsonHelp}><IconHelp /></ButtonGhost>
          </div>
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
        <SubmenuItem
          icon={IconPaymentMethod}
          chevron
          href={route('/events/[id]/edit/tickets/[ticket]/payment', {
            id: $page.params.id,
            ticket: $page.params.ticket,
          })}
        >
          Méthodes de paiement autorisées
          <svelte:fragment slot="subtext">
            <LoadingText
              value={sentenceJoin(
                event.ticket.allowedPaymentMethods
                  .filter(loaded)
                  .map((m) => DISPLAY_PAYMENT_METHODS[m]),
                'or',
              ) || 'Aucune'}
            />
            {#if loading(event.ticket.minimumPrice, 0) > 0 && loading(event.ticket.allowedPaymentMethods, []).length === 0}
              <span
                class="warning no-payment-method"
                use:tooltip={"Le billet est payant, mais aucune méthode de paiement n'est autorisée!"}
              >
                <IconWarning />
              </span>
            {/if}
          </svelte:fragment>
        </SubmenuItem>
        <SubmenuItem
          icon={IconTicketGroup}
          href={route('/events/[id]/edit/tickets/[ticket]/group', {
            id: $page.params.id,
            ticket: $page.params.ticket,
          })}
          subtext={mapLoading(event.ticket.group, (g) => g?.name ?? 'Aucun groupe')}
        >
          Groupe de billet
        </SubmenuItem>
        <SubmenuItem
          icon={IconCountingPolicy}
          href={route('/events/[id]/edit/tickets/[ticket]/counting', {
            id: $page.params.id,
            ticket: $page.params.ticket,
          })}
          subtext={mapLoading(
            event.ticket.countingPolicy,
            (policy) => DISPLAY_TICKET_COUNTING_POLICY[policy],
          )}
        >
          Décompte des places restantes
        </SubmenuItem>
      </Submenu>
      <section class="constraints">
        <header>
          <h2 class="typo-field-label">Contraintes</h2>
          <p class="muted typo-details">
            Pour qu'une personne puisse réserver une place, l'ensemble des contraintes définies
            ci-dessous doivent être toutes remplies. <br />
          </p>
        </header>
        <Submenu>
          <SubmenuItem
            icon={IconManagersOnly}
            label
            subtext={mapLoading(event.ticket.onlyManagersCanProvide, (only) =>
              only ? "Personne d'autre ne peut réserver" : 'Non',
            )}
          >
            Managers seulement
            <InputToggle
              slot="right"
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
          {#if !loading(event.ticket.onlyManagersCanProvide, false)}
            <SubmenuItemBooleanConstraint
              errorMessage="Impossible de changer la contrainte sur les cotisant·e·s"
              optimisticResponseField="openToContributors"
              ticketId={event.ticket.id}
              mutation={LimitToContributors}
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
              errorMessage="Impossible de changer la contrainte sur les alumnis"
              optimisticResponseField="openToAlumni"
              ticketId={event.ticket.id}
              mutation={LimitToAlumni}
              value={event.ticket.openToAlumni}
              icon={IconAlumni}
              subtext="Anciens élèves"
            >
              Alumnis
            </SubmenuItemBooleanConstraint>
            <SubmenuItemBooleanConstraint
              errorMessage="Impossible de changer la contrainte sur les FISAs"
              optimisticResponseField="openToApprentices"
              ticketId={event.ticket.id}
              mutation={LimitToApprentices}
              value={event.ticket.openToApprentices}
              icon={IconApprentice}
              subtext="FISAs"
            >
              Apprenti·e·s
            </SubmenuItemBooleanConstraint>
            <SubmenuItemBooleanConstraint
              errorMessage="Impossible de changer la contrainte sur les externes"
              optimisticResponseField="openToExternal"
              ticketId={event.ticket.id}
              mutation={LimitToExternal}
              value={event.ticket.openToExternal}
              icon={IconExternalUser}
              subtext={onceAllLoaded(
                [
                  event.organizer.studentAssociation.school.name,
                  ...event.ticket.openToMajors.flatMap((m) => m.schools.map((s) => s.name)),
                ],
                (...names) =>
                  `Personnes extérieures à ${sentenceJoin([...new Set(names).values()], 'and')}`,
                "Personnes extérieures à l'école",
              )}
            >
              Externes
            </SubmenuItemBooleanConstraint>
            <PickGroup
              multiple
              let:open
              value={mapAllLoading(
                event.ticket.openToGroups.map((g) => g.uid),
                (...uids) => uids,
              )}
              options={groups}
              on:finish={async ({ detail }) => {
                if (!event.ticket) return;
                const result = await mutate(LimitToGroupMembers, {
                  ticket: event.ticket.id,
                  groupMembers: detail,
                });
                toasts.mutation(
                  result,
                  'updateTicketConstraints',
                  '',
                  'Impossible de changer les groupes autorisés',
                );
              }}
            >
              <SubmenuItem
                icon={IconGroupMember}
                clickable
                on:click={open}
                subtext={mapAllLoading(
                  event.ticket.openToGroups.map((g) => g.uid),
                  (...uids) => {
                    if (uids.length === 0) return 'Aucune contrainte';
                    return `Membres de ${sentenceJoin(uids, 'or')}`;
                  },
                )}
              >
                Membres d'un des groupes
                <ul class="groups side-by-side" slot="right">
                  {#each event.ticket.openToGroups as group}
                    <li>
                      <AvatarGroup {group} />
                    </li>
                  {/each}
                </ul>
              </SubmenuItem>
            </PickGroup>
            <PickMajor
              multiple
              let:open
              options={majors}
              value={mapAllLoading(
                event.ticket.openToMajors.map((m) => m.uid),
                (...uids) => uids,
              )}
              on:finish={async ({ detail }) => {
                if (!event.ticket) return;
                toasts.mutation(
                  await mutate(LimitToMajors, {
                    ticket: event.ticket.id,
                    majors: detail,
                  }),
                  'updateTicketConstraints',
                  '',
                  'Impossible de changer la contrainte sur les filières',
                  {
                    constraintsWereSimplified: 'info',
                  },
                );
              }}
            >
              <SubmenuItem
                clickable
                on:click={open}
                icon={IconStudentOf}
                subtext={mapAllLoading(
                  event.ticket.openToMajors.map((m) => m.shortName),
                  (...names) => {
                    if (names.length === 0) return 'Aucune contrainte';
                    return `Étudiant·e·s de ${sentenceJoin(names, 'or')}`;
                  },
                )}
              >
                Étudiant·e·s de
              </SubmenuItem>
            </PickMajor>

            <SubmenuItem
              icon={IconPromotion}
              subtext={mapAllLoading(event.ticket.openToPromotions, (...names) => {
                if (names.length === 0) return 'Aucune contrainte';
                return `Promos ${sentenceJoin(
                  names.map((x) => x.toString()),
                  'or',
                )}`;
              })}
              >Promos
              <InputCheckboxes
                value={mapAllLoading(event.ticket.openToPromotions, (...promos) => promos)}
                slot="right"
                options={[0, 1, 2].map((i) => [fromYearTier(i + 1), `${i + 1}A`])}
                on:change={async ({ detail }) => {
                  if (!event.ticket) return;
                  toasts.mutation(
                    await mutate(LimitToPromotions, {
                      ticket: event.ticket.id,
                      promotions: detail,
                    }),
                    'updateTicketConstraints',
                    '',
                    'Impossible de changer la contrainte sur les promotions',
                  );
                }}
              />
            </SubmenuItem>
          {/if}
        </Submenu>
        {#if loading(event.ticket.onlyManagersCanProvide, false)}
          <Alert theme="warning">
            <p>
              Seul un·e manager peut réserver des places sur ce billet. Ceci est pratique quand les
              contraintes de réservation sont trop complexes pour être exprimées sur Churros, et
              sont gérées manuellement par l'orga.
            </p>
          </Alert>
        {/if}
      </section>
      <section class="actions">
        <ButtonSecondary
          danger
          on:click={() => {
            openDeleteModal();
          }}>Supprimer le billet</ButtonSecondary
        >
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
    --checkboxes-direction: row;

    margin-top: 2rem;
  }

  .constraints header {
    --weight-field-label: 900;

    margin-bottom: 1rem;
  }

  .constraints p.muted {
    margin-top: 0.5rem;
    font-weight: normal;
    line-height: 1.1;
  }

  .side-by-side {
    display: flex;
    gap: 0.5ch;
    align-items: center;
  }

  .no-payment-method {
    font-size: 1.5em;
  }

  .actions {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 3rem;
  }
</style>
