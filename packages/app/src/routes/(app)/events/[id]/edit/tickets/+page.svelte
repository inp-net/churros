<script lang="ts">
  import { goto } from '$app/navigation';
  import { route } from '$lib/ROUTES';
  import {
    ButtonSecondary,
    InputText,
    InputToggle,
    MaybeError,
    Submenu,
    SubmenuItem,
    TextTicketSummary,
  } from '$lib/components';
  import {
    LoadingText,
    loaded,
    loading,
    mapAllLoading,
    mapLoading,
    onceLoaded,
  } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { toasts } from '$lib/toasts';
  import { subDays } from 'date-fns';
  import IconBeneficiary from '~icons/msl/account-balance-outline';
  import IconChevronRight from '~icons/msl/chevron-right';
  import IconRemainingPlaces from '~icons/msl/clock-loader-90';
  import IconCapacity from '~icons/msl/file-copy-outline';
  import IconAdd from '~icons/msl/add';
  import type { PageData } from './$houdini';
  import { ChangeCapacity, CreateTicket, SetEventShowRemainingPlaces } from './mutations';

  export let data: PageData;
  $: ({ PageEditEventTickets } = data);
</script>

<MaybeError result={$PageEditEventTickets} let:data={{ event }}>
  <div class="contents">
    <Submenu>
      <SubmenuItem
        icon={IconRemainingPlaces}
        label
        subtext={mapLoading(event.showPlacesLeft, (show) =>
          show ? 'Affiché' : 'Caché (excepté pour les managers)',
        )}
      >
        Nombre de places restantes
        <InputToggle
          slot="right"
          value={event.showPlacesLeft}
          on:update={async ({ detail }) => {
            toasts.mutation(
              await mutate(SetEventShowRemainingPlaces, {
                id: event.id,
                showRemainingPlaces: detail,
              }),
              'updateEvent',
              '',
              `Impossible de ${detail ? 'montrer' : 'cacher'} les places restantes`,
            );
          }}
        />
      </SubmenuItem>
      <SubmenuItem icon={IconCapacity} label subtext="Limite sur l'ensemble des places">
        Capacité totale
        <InputText
          slot="right"
          clearable
          label=""
          inputmode="decimal"
          value={onceLoaded(event.globalCapacity, (x) => x?.toString() ?? '', '')}
          placeholder="Illimité"
          on:blur={async ({ currentTarget }) => {
            if (!(currentTarget instanceof HTMLInputElement)) return;
            const coerced =
              currentTarget.value === '' ? null : Number.parseInt(currentTarget.value);
            if (coerced !== null && Number.isNaN(coerced)) return;

            toasts.mutation(
              await mutate(ChangeCapacity, {
                id: event.id,
                capacity: coerced,
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
        on:click={() => alert('TODO')}
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
            {#if ticket.group && loaded(ticket.group.name)}
              <LoadingText value={ticket.group.name} />
              <div class="group-name-separator">
                <IconChevronRight />
              </div>
            {/if}
            <svelte:element this={ticket.name === '' ? 'em' : 'span'}>
              <LoadingText value={mapLoading(ticket.name, (name) => name || 'Billet sans nom')} />
            </svelte:element>
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
    </section>
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  .tickets {
    margin-top: 2rem;
  }

  .tickets header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    --weight-field-label: 900;
  }

  .tickets em {
    color: var(--muted);
  }

  .icon-add {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2em;
  }
</style>
