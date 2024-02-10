<script lang="ts">
  import { toasts } from '$lib/toasts';
  import { createEventDispatcher, tick } from 'svelte';
  import IconDelete from '~icons/mdi/delete-outline';
  import IconAdd from '~icons/mdi/plus';
  import ButtonGhost from './ButtonGhost.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import { defaultTicket, isShadowValue, shadowValue, type Ticket } from './FormEventBeta.svelte';
  import FormTicketBeta from './FormTicketBeta.svelte';
  import InputNumber from './InputNumber.svelte';
  import InputText from './InputText.svelte';
  import Modal from './Modal.svelte';
  import { TicketMove, zeus } from '$lib/zeus';
  // import omit from 'lodash.omit';
  const dispatch = createEventDispatcher();

  export let eventId: string;
  export let tickets: Ticket[];
  export let ticketGroups: Array<{ uid: string; name: string; capacity: number }>;
  export let startsAt: Date | undefined = undefined;
  export let endsAt: Date | undefined = undefined;

  let editingTicket: Ticket | undefined;
  let ticketEditModalElement: HTMLDialogElement;
  let movingTicketUid = '';

  // list of IDs
  let ticketsOrdering = tickets.sort((a, b) => a.order - b.order).map((t) => t.uid);
  let ticketsOrderingBeforeDragStart = structuredClone(ticketsOrdering);

  function listOfUids(o: Array<{ uid: string }>) {
    return o.map((o) => o.uid);
  }

  function compareTickets(ticketsOrdering: string[]): (t1: Ticket, t2: Ticket) => number {
    return (t1, t2) => ticketsOrdering.indexOf(t1.uid) - ticketsOrdering.indexOf(t2.uid);
  }

  async function moveTicketBefore(uid: string) {
    ticketsOrdering = ticketsOrdering.filter((t) => t !== movingTicketUid);
    ticketsOrdering = [
      ...ticketsOrdering.slice(0, ticketsOrdering.indexOf(uid) - 1),
      movingTicketUid,
      ...ticketsOrdering.slice(ticketsOrdering.indexOf(uid)),
    ];
    await $zeus.mutate({
      moveTicket: [
        {
          eventId,
          move: TicketMove.MoveBefore,
          other: uid,
          uid: movingTicketUid,
        },
        true,
      ],
    });
  }

  async function moveTicketAfter(uid: string | undefined) {
    if (!uid) return;
    ticketsOrdering = ticketsOrdering.filter((t) => t !== movingTicketUid);
    ticketsOrdering = [
      ...ticketsOrdering.slice(0, ticketsOrdering.indexOf(uid)),
      movingTicketUid,
      ...ticketsOrdering.slice(ticketsOrdering.indexOf(uid) + 1),
    ];
    await $zeus.mutate({
      moveTicket: [
        {
          eventId,
          move: TicketMove.MoveAfter,
          other: uid,
          uid: movingTicketUid,
        },
        true,
      ],
    });
  }

  $: ticketsByGroup = [
    ['', tickets.filter((t) => !t.group?.uid).sort(compareTickets(ticketsOrdering))],
    ...ticketGroups.map((g) => [
      g.uid,
      tickets.filter((t) => t.group?.uid === g.uid).sort(compareTickets(ticketsOrdering)),
    ]),
  ] as Array<[string, Ticket[]]>;

  $: tickets.sort((a, b) => ticketsOrdering.indexOf(a.uid) - ticketsOrdering.indexOf(b.uid));

  $: hasGroups = ticketGroups.length > 0;
</script>

<ul class="tickets">
  {#each ticketsByGroup as [groupUid, ticketsOfGroup] (groupUid)}
    {@const group = ticketGroups.find((g) => g.uid === groupUid)}
    {#if group}
      <li class="group">
        <div class="data">
          <InputText
            inline
            label=""
            bind:value={ticketGroups[ticketGroups.findIndex((g) => g.uid === groupUid)].name}
            placeholder="Groupe sans nom"
          />
          &middot;
          <InputNumber
            inline
            label=""
            bind:value={ticketGroups[ticketGroups.findIndex((g) => g.uid === groupUid)].capacity}
          />
          place{#if group.capacity > 1}s{/if}
        </div>
        <ButtonGhost
          danger
          type="button"
          on:click={() => {
            tickets = tickets.filter((t) => t.group?.uid !== groupUid);
            ticketGroups = ticketGroups.filter((g) => g.uid !== groupUid);
          }}
        >
          <IconDelete></IconDelete>
        </ButtonGhost>
      </li>
    {:else if hasGroups}
      <li class="group none">Sans groupe</li>
    {/if}
    {#each ticketsOfGroup as ticket (ticket.id)}
      <div
        role="listitem"
        class="ticket-draggable-wrapper"
        draggable="true"
        on:dragstart={() => {
          movingTicketUid = ticket.uid;
        }}
        on:dragenter={() => {
          // if dragging over moving ticket, do nothing
          if (movingTicketUid === ticket.uid) return;
          if (
            ticketsOrdering.indexOf(ticket.uid) === ticketsOrdering.length - 1 &&
            ticketsOrderingBeforeDragStart.indexOf(movingTicketUid) <
              ticketsOrderingBeforeDragStart.indexOf(ticket.uid)
          ) {
            // if this ticket is the last, move it after the last
            moveTicketAfter(ticketsOrdering.at(-1));
          } else {
            // Move moving ticket before this ticket only if moving ticket was before this ticket before dragging started
            moveTicketBefore(ticket.uid);
          }
        }}
        on:dragend={() => {
          movingTicketUid = '';
          ticketsOrderingBeforeDragStart = structuredClone(ticketsOrdering);
        }}
        on:drop={() => {
          movingTicketUid = '';
        }}
      >
        <button
          on:click={() => {
            // Preserve unsaved data from editingTicket when re-editing the same
            if (editingTicket?.id !== ticket.id) editingTicket = { ...ticket };
            ticketEditModalElement.showModal();
          }}
          class:dragging={ticket.uid === movingTicketUid}
          class:indented={hasGroups}
          class="ticket"
          type="button"
        >
          {ticket.name || 'Billet sans nom'}
          <span class="price"
            >{ticket.price}€{#if ticket.capacity > 0}, {ticket.capacity} places{/if}</span
          >
        </button>
      </div>
    {/each}
    <li class="new">
      <button
        class:indented={hasGroups}
        class="new ticket"
        type="button"
        on:dragend={() => {
          movingTicketUid = '';
          ticketsOrderingBeforeDragStart = structuredClone(ticketsOrdering);
        }}
        on:drop={() => {
          movingTicketUid = '';
          ticketsOrderingBeforeDragStart = structuredClone(ticketsOrdering);
        }}
        on:dragenter={() => {
          // Move moving ticket to this group if it's not the moving ticket's current group
          const movingTicket = tickets.find((t) => t.uid === movingTicketUid);
          if (!movingTicket) return;
          if (groupUid === movingTicket.group?.uid) {
            moveTicketAfter(
              Object.fromEntries(ticketsByGroup)
                [groupUid ?? ''].sort(compareTickets(ticketsOrdering))
                .reverse()[0].uid,
            );
          } else {
            tickets[tickets.findIndex((t) => t.uid === movingTicketUid)].group = groupUid
              ? { uid: groupUid }
              : undefined;
          }
        }}
        on:click={() => {
          const newTicket = defaultTicket(
            { tickets, startsAt, endsAt },
            shadowValue(),
            shadowValue(),
            ticketsOrdering.length,
          );
          if (groupUid) newTicket.group = { uid: groupUid };
          tickets = [...tickets, newTicket];
          ticketsOrdering = [...ticketsOrdering, newTicket.uid];
          editingTicket = { ...newTicket };
          ticketEditModalElement.showModal();
        }}
        >Nouveau billet {#if group}
          dans {group.name || 'groupe sans nom'}{/if}</button
      >
    </li>
  {/each}
  <li class="new-group">
    <ButtonSecondary
      type="button"
      icon={IconAdd}
      on:click={() => {
        const group = {
          id: shadowValue(),
          uid: shadowValue(),
          capacity: 0,
          name: '',
        };
        ticketGroups = [...ticketGroups, group];
      }}>Nouveau groupe de billet</ButtonSecondary
    >
  </li>
</ul>

<Modal noPadding bind:element={ticketEditModalElement} maxWidth="1300px">
  {#if editingTicket}
    <FormTicketBeta
      bind:ticket={editingTicket}
      on:save={async ({ detail: ticket }) => {
        tickets[tickets.findIndex((t) => t.uid === ticket.uid)] = { ...ticket };
        dispatch('save', ticket);
        ticketEditModalElement.close();
        console.log('upading ticket');
        await $zeus.mutate({
          upsertTicket: [
            {
              id: isShadowValue(ticket.id) ? undefined : ticket.id,
              eventId,
              ticket: {
                ...omit(ticket, ['id', 'uid', 'group']),
                name: ticket.name || undefined,
                autojoinGroups: ticket.autojoinGroups.map((g) => g.uid),
                openToGroups: listOfUids(ticket.openToGroups),
                openToMajors: listOfUids(ticket.openToMajors),
                openToSchools: listOfUids(ticket.openToSchools),
              },
            },
            {
              id: true,
              uid: true,
            },
          ],
        });
        if (ticket.group) {
          //TODO
        }
        toasts.success('Billet sauvegardé');
      }}
      on:delete={async ({ detail: ticket }) => {
        tickets = tickets.filter((t) => t.id !== ticket.id);
        dispatch('save', ticket);
        ticketEditModalElement.close();
        await $zeus.mutate({
          deleteTicket: [{ id: ticket.id }, true],
        });
        toasts.success('Billet supprimé');
      }}
    ></FormTicketBeta>
  {/if}
</Modal>

<style>
  .group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 400px;
  }

  .group.none {
    color: var(--muted);
  }

  .tickets {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    list-style: none;
  }

  .ticket {
    display: flex;
    flex-grow: 1;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 400px;
    padding: 1rem 1.5rem;
    font-size: 1rem;
    cursor: pointer;
    background-color: var(--muted-bg);
    border: none;
    border: var(--border-block) solid transparent;
    border-radius: var(--radius-block);
    box-shadow: none;
    transition: margin 0.25s ease;
    flex-wrap: wrap;
    text-align: left;
  }

  .ticket.new {
    background: transparent;
    border: var(--border-block) dashed var(--border);
  }

  .ticket.indented {
    width: calc(100% - 2rem);
    margin-left: 2rem;
  }

  .ticket:hover {
    background-color: var(--hover-bg);
  }

  .ticket.dragging {
    background-color: color-mix(in srgb, var(--primary-bg) 15%, transparent);
    opacity: 0.5;
  }

  .ticket .price {
    font-weight: bold;
    color: var(--muted);
  }
</style>
