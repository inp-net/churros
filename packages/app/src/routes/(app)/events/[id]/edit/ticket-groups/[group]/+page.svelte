<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { route } from '$lib/ROUTES';
  import Alert from '$lib/components/Alert.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { LoadingText, loading, mapLoading, onceLoaded } from '$lib/loading';
  import { mutateAndToast } from '$lib/mutations';
  import { toasts } from '$lib/toasts';
  import IconCapacity from '~icons/msl/file-copy-outline';
  import { UpdateGroupOfTicket } from '../../tickets/[ticket]/mutations';
  import { DeleteTicketGroup } from '../../tickets/mutations';
  import type { PageData } from './$houdini';
  import { UpdateTicketGroup } from './mutations';

  export let data: PageData;
  $: ({ PageEventTicketGroupEdit } = data);
</script>

<MaybeError result={$PageEventTicketGroupEdit} let:data={{ event }}>
  {@const group = event.ticketGroup}
  {#if group}
    <div class="contents">
      <InputText
        on:blur={async ({ currentTarget }) => {
          if (!(currentTarget instanceof HTMLInputElement)) return;
          if (!group) return;
          await mutateAndToast(
            UpdateTicketGroup,
            {
              group: group.id,
              name: currentTarget.value,
            },
            {
              error: 'Impossible de changer le nom du groupe de billet',
            },
          );
        }}
        value={loading(group.name, '')}
        required
        label="Nom du groupe"
        placeholder="Sans nom"
      ></InputText>
      <Submenu>
        <SubmenuItem
          icon={IconCapacity}
          label
          subtext={mapLoading(group.capacity, (cap) => `${cap} place${cap > 1 ? 's' : ''}`)}
        >
          Capacité

          <InputText
            label=""
            inputmode="decimal"
            slot="right"
            value={onceLoaded(group.capacity, (x) => x.toString(), '')}
            on:blur={async ({ currentTarget }) => {
              if (!(currentTarget instanceof HTMLInputElement)) return;
              if (!group) return;
              const coerced = currentTarget.value ? Number.parseFloat(currentTarget.value) : 0;
              if (Number.isNaN(coerced)) toasts.error('Le nombre de places doit être un nombre');

              await mutateAndToast(
                UpdateTicketGroup,
                {
                  group: group.id,
                  capacity: coerced,
                },
                {
                  error: 'Impossible de changer la capacité du billet',
                },
              );
            }}
          />
        </SubmenuItem>
      </Submenu>
      <section class="pick-tickets">
        <h2 class="typo-field-label">Billets</h2>
        <Submenu>
          {#each event.tickets as ticket}
            <SubmenuItem label icon={null} subtext={ticket.group?.name ?? 'Aucun groupe'}>
              <LoadingText value={ticket.name} />
              <InputCheckbox
                slot="right"
                label=""
                value={onceLoaded(
                  ticket.group?.localID,
                  (gid) => gid === $page.params.group,
                  false,
                )}
                on:change={async ({ currentTarget }) => {
                  if (!(currentTarget instanceof HTMLInputElement)) return;
                  if (!ticket) return;
                  if (!group) return;
                  const originalTicketGroup = structuredClone(ticket.group);
                  await mutateAndToast(
                    UpdateGroupOfTicket,
                    {
                      ticket: ticket.localID,
                      group: currentTarget.checked ? group.id : null,
                    },
                    {
                      error: `Impossible de déplacer ${loading(ticket.name, '…')} dans ce groupe de billet`,
                      success:
                        originalTicketGroup && currentTarget.checked
                          ? `Le billet a été déplacé depuis ${loading(originalTicketGroup.name, '…')}`
                          : '',
                    },
                  );
                }}
              ></InputCheckbox>
            </SubmenuItem>
          {/each}
        </Submenu>
      </section>

      <section class="actions">
        <ButtonSecondary
          danger
          help="Ne supprime pas les billets du groupe"
          on:click={async () => {
            await mutateAndToast(DeleteTicketGroup, {
              id: $page.params.group,
            });
            await goto(route('/events/[id]/edit/tickets', $page.params.id));
          }}>Supprimer le groupe</ButtonSecondary
        >
      </section>
    </div>
  {:else}
    <Alert theme="danger">Groupe de billets non trouvé</Alert>
  {/if}
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  h2 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-weight: bold;
  }

  .actions {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }
</style>
