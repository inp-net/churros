<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import PickLydiaAccount from './PickBeneficiary.svelte';
  import { route } from '$lib/ROUTES';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import InputToggle from '$lib/components/InputToggle.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import TextTicketSummary from '$lib/components/TextTicketSummary.svelte';
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
  import {
    ChangeCapacity,
    CreateTicket,
    SetEventShowRemainingPlaces,
    SetEventBeneficiary,
    UnsetEventBeneficiary,
  } from './mutations';
  import CardTicket from '$lib/components/CardTicket.svelte';

  export let data: PageData;
  $: ({ PageEditEventTickets } = data);

  let pickLydiaAccount: () => void;
  $: if ($page.url.hash === '#beneficiary') pickLydiaAccount?.();
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
    align-items: center;
    justify-content: space-between;

    --weight-field-label: 900;
  }

  .tickets em {
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
</style>
