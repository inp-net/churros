<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { route } from '$lib/ROUTES';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import CardTicket from '$lib/components/CardTicket.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import TextTicketGroupSummary from '$lib/components/TextTicketGroupSummary.svelte';
  import TextTicketSummary from '$lib/components/TextTicketSummary.svelte';
  import {
    LoadingText,
    loaded,
    loading,
    mapAllLoading,
    mapLoading,
    onceLoaded,
  } from '$lib/loading';
  import { mutate, mutateAndToast } from '$lib/mutations';
  import { toasts } from '$lib/toasts';
  import { subDays } from 'date-fns';
  import IconBeneficiary from '~icons/msl/account-balance-outline';
  import IconAdd from '~icons/msl/add';
  import IconShowPlacesLeft from '~icons/msl/check';
  import IconChevronRight from '~icons/msl/chevron-right';
  import IconRemainingPlaces from '~icons/msl/clock-loader-90';
  import IconHideCapacity from '~icons/msl/close';
  import IconCapacity from '~icons/msl/file-copy-outline';
  import IconHelp from '~icons/msl/help-outline';
  import IconCapacityOnly from '~icons/msl/stacks-outline';
  import type { PageData } from './$houdini';
  import PickLydiaAccount from './PickBeneficiary.svelte';
  import {
    ChangeCapacity,
    CreateTicket,
    CreateTicketGroup,
    SetEventBeneficiary,
    SetEventPlacesVisibility,
    UnsetEventBeneficiary,
  } from './mutations';
  import { stringifyCapacity } from '$lib/display';

  export let data: PageData;
  $: ({ PageEditEventTickets } = data);

  let pickLydiaAccount: () => void;
  $: if ($page.url.hash === '#beneficiary') pickLydiaAccount?.();

  let openPlacesVisibilityHelp: () => void;
</script>

<MaybeError result={$PageEditEventTickets} let:data={{ event }}>
  <PickLydiaAccount
    currentAccount={event.beneficiary?.id ?? null}
    on:pick={async ({ detail }) => {
      toasts.mutation(
        await mutate(detail ? SetEventBeneficiary : UnsetEventBeneficiary, {
          id: $page.params.id,
          // @ts-expect-error variable is not used by both mutations, but it's fine
          beneficiary: detail || null,
        }),
        'setEventBeneficiary',
        '',
        'Impossible de mettre à jour le compte bénéficiaire',
      );
    }}
    accounts={event.organizer.lydiaAccounts}
    bind:open={pickLydiaAccount}
  />
  <div class="contents">
    <Submenu>
      <SubmenuItem
        icon={IconRemainingPlaces}
        clickable
        on:click={async () => {
          if (!loaded(event.showPlacesLeft) || !loaded(event.showCapacity)) return;
          const newValues = {
            // Cycler entre les 3 états: showPlacesLeft+showCapacity, showCapacity seulement et aucun
            showCapacity: event.showPlacesLeft ? true : event.showCapacity ? false : true,
            showRemainingPlaces: event.showPlacesLeft ? false : event.showCapacity ? false : true,
          };
          await mutateAndToast(
            SetEventPlacesVisibility,
            {
              id: $page.params.id,
              ...newValues,
            },
            {
              error: 'Impossible de modifier la visibilité du nombre de places',
              // optimistic: {
              //   updateEvent: {
              //     __typename: "MutationUpdateEventSuccess",
              //     data: newValues
              //   }
              // }
            },
          );
        }}
      >
        Visibilité du nombre de places
        <div class="places-visiblity-subtext" slot="subtext">
          <LoadingText
            value={mapAllLoading(
              [event.showPlacesLeft, event.showCapacity],
              (placesLeft, capacity) =>
                placesLeft
                  ? 'Total & restantes visibles'
                  : capacity
                    ? 'Places restantes cachées'
                    : 'Total & restantes cachées',
            )}
          />
          <ButtonInk
            inline
            neutral
            insideProse
            icon={IconHelp}
            on:click={(e) => {
              e.stopPropagation();
              openPlacesVisibilityHelp();
            }}
          >
            Aide
          </ButtonInk>
        </div>
        <ModalOrDrawer
          narrow
          notrigger
          title="Visiblité des places restantes"
          bind:open={openPlacesVisibilityHelp}
        >
          <p>
            Le nombre de places restantes est toujours visible par les managers avec Modification ou
            plus
          </p>
        </ModalOrDrawer>
        <svelte:fragment slot="right">
          {#if loaded(event.showPlacesLeft) && loaded(event.showCapacity)}
            <div
              class="places-visibility-indicator
              {event.showPlacesLeft ? 'success' : event.showCapacity ? 'warning' : 'danger'}"
            >
              {#if event.showPlacesLeft}
                <IconShowPlacesLeft />
              {:else if event.showCapacity}
                <IconCapacityOnly />
              {:else}
                <IconHideCapacity />
              {/if}
            </div>
          {/if}
        </svelte:fragment>
      </SubmenuItem>
      <SubmenuItem icon={IconCapacity} label subtext="Limite sur l'ensemble des places">
        Capacité totale
        <InputText
          slot="right"
          clearable
          label=""
          inputmode="decimal"
          value={onceLoaded(event.globalCapacity, stringifyCapacity, '')}
          placeholder="Illimité"
          on:blur={async ({ currentTarget }) => {
            if (!(currentTarget instanceof HTMLInputElement)) return;
            const coerced =
              currentTarget.value === '' ? null : Number.parseInt(currentTarget.value);
            if (coerced !== null && Number.isNaN(coerced)) return;

            toasts.mutation(
              await mutate(ChangeCapacity, {
                id: event.id,
                capacity: coerced ?? 'Unlimited',
              }),
              'updateEvent',
              '',
              'Impossible de mettre à jour la capacité totale',
            );
          }}
        />
      </SubmenuItem>
      <SubmenuItem
        clickable
        anchor="#beneficiary"
        on:click={pickLydiaAccount}
        icon={IconBeneficiary}
        subtext={event.beneficiary?.name ?? 'Aucun'}
      >
        Compte Lydia bénéficiaire
      </SubmenuItem>
    </Submenu>

    <section class="tickets">
      <header>
        <h2 class="typo-field-label">Billets</h2>
        <ButtonSecondary
          on:click={async () => {
            if (!event.startsAt || !event.endsAt) {
              toasts.error("Donne des dates à l'évènement avant de créer des billets");
              return;
            }
            if (!loaded(event.startsAt) || !loaded(event.endsAt)) return;

            const result = await mutate(CreateTicket, {
              event: event.id,
              shotgun: {
                start: subDays(event.startsAt, 1),
                end: event.endsAt,
              },
            });
            if (toasts.mutation(result, 'createTicket', '', 'Impossible de créer le billet')) {
              await goto(
                route('/events/[id]/edit/tickets/[ticket]', {
                  id: result.data.createTicket.data.event.localID,
                  ticket: result.data.createTicket.data.localID,
                }),
              );
            }
          }}>Ajouter</ButtonSecondary
        >
      </header>

      <Submenu>
        {#each event.tickets as ticket}
          <SubmenuItem
            icon={null}
            href={route('/events/[id]/edit/tickets/[ticket]', {
              id: loading(event.localID, ''),
              ticket: loading(ticket.localID, ''),
            })}
          >
            <span class="ticket-full-name">
              {#if ticket.group && loaded(ticket.group.name)}
                <LoadingText
                  tag={ticket.group.name ? 'span' : 'em'}
                  value={ticket.group.name || 'Groupe sans nom'}
                />
                <div class="group-name-separator">
                  <IconChevronRight />
                </div>
              {/if}
              <LoadingText
                tag={ticket.name ? 'span' : 'em'}
                value={mapLoading(ticket.name, (name) => name || 'Billet sans nom')}
              />
            </span>
            <TextTicketSummary slot="subtext" {ticket} />
          </SubmenuItem>
        {/each}
        <SubmenuItem
          icon={null}
          clickable
          on:click={async () => {
            const result = await mutate(CreateTicket, {
              event: event.id,
              shotgun: mapAllLoading([event.startsAt, event.endsAt], (start, end) => ({
                start: subDays(start, 1),
                end,
              })),
            });
            if (toasts.mutation(result, 'createTicket', '', 'Impossible de créer le billet')) {
              await goto(
                route('/events/[id]/edit/tickets/[ticket]', {
                  id: result.data.createTicket.data.event.localID,
                  ticket: result.data.createTicket.data.localID,
                }),
              );
            }
          }}
        >
          Nouveau billet
          <div class="icon-add" slot="right">
            <IconAdd />
          </div>
        </SubmenuItem>
      </Submenu>

      {#if event.tickets.length === 0}
        <section class="external-suggestion">
          <Alert theme="primary">
            <h2>Billetterie externe à Churros?</h2>
            <p>
              Tu peux <a href={route('/events/[id]/edit/links', $page.params.id)}
                >ajouter un lien à l'évènement</a
              > nommé "Billetterie" pour que ça apparaisse sur la page de l'évènement comme une place:
            </p>
            <CardTicket
              --background="transparent"
              ticket={null}
              externalURL={new URL('https://example.com')}
            />
          </Alert>
        </section>
      {/if}
    </section>

    <section class="groups" id="groups">
      <header>
        <h2 class="typo-field-label">Groupes de billets</h2>
        <ButtonSecondary
          on:click={async () => {
            const result = await mutate(CreateTicketGroup, {
              event: event.id,
            });
            if (
              toasts.mutation(
                result,
                'upsertTicketGroup',
                '',
                'Impossible de créer le groupe de billet',
              )
            ) {
              await goto(
                route('/events/[id]/edit/ticket-groups/[group]', {
                  id: result.data.upsertTicketGroup.data.event.localID,
                  group: result.data.upsertTicketGroup.data.localID,
                }),
              );
            }
          }}>Ajouter</ButtonSecondary
        >
      </header>

      <Submenu>
        {#each event.ticketGroups as ticketgroup}
          <SubmenuItem
            icon={null}
            href={route('/events/[id]/edit/ticket-groups/[group]', {
              id: loading(event.localID, ''),
              group: loading(ticketgroup.localID, ''),
            })}
          >
            <svelte:element this={ticketgroup.name === '' ? 'em' : 'span'}>
              <LoadingText
                value={mapLoading(ticketgroup.name, (name) => name || 'Groupe sans nom')}
              />
            </svelte:element>
            <TextTicketGroupSummary slot="subtext" group={ticketgroup} />
          </SubmenuItem>
        {/each}
        <SubmenuItem
          icon={null}
          clickable
          on:click={async () => {
            const result = await mutate(CreateTicketGroup, {
              event: event.id,
            });
            if (
              toasts.mutation(
                result,
                'upsertTicketGroup',
                '',
                'Impossible de créer un groupe de billet',
              )
            ) {
              await goto(
                route('/events/[id]/edit/ticket-groups/[group]', {
                  id: result.data.upsertTicketGroup.data.event.localID,
                  group: result.data.upsertTicketGroup.data.localID,
                }),
              );
            }
          }}
        >
          Nouveau groupe
          <div class="icon-add" slot="right">
            <IconAdd />
          </div>
        </SubmenuItem>
      </Submenu>
    </section>
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  .ticket-full-name {
    display: flex;
    align-items: center;
  }

  .tickets,
  .groups {
    margin-top: 2rem;
  }

  .tickets header,
  .groups header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    --weight-field-label: 900;
  }

  .tickets :global(em),
  .groups :global(em) {
    color: var(--muted);
  }

  .icon-add {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;
  }

  .external-suggestion {
    margin-top: 3rem;
  }

  .external-suggestion *:not(:last-child) {
    margin-bottom: 1rem;
  }

  .places-visibility-indicator {
    font-size: 1.5rem;
  }
</style>
