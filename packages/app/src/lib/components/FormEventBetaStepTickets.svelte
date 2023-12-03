<script lang="ts">
  import { toasts } from '$lib/toasts';
  import { fly } from 'svelte/transition';
  import { defaultTicket, shadowId, type Ticket } from './FormEventBeta.svelte';
  import FormTicketBeta from './FormTicketBeta.svelte';
  import { createEventDispatcher } from 'svelte';
  import { entries, findIndex, groupBy, uniqBy } from 'lodash';
  import InputText from './InputText.svelte';
  import InputNumber from './InputNumber.svelte';
  const dispatch = createEventDispatcher();

  export let tickets: Ticket[];
  export let ticketGroups: Array<{ id: string; name: string; capacity: number }>;

  export let startsAt: Date | undefined = undefined;
  export let endsAt: Date | undefined = undefined;

  let expandedTicketId = '';
  let movingTicketId = '';

  // list of IDs
  let ticketsOrdering = tickets.map((t) => t.id);
  let ticketsOrderingBeforeDragStart = structuredClone(ticketsOrdering);

  function compareTickets(ticketsOrdering: string[]): (t1: Ticket, t2: Ticket) => number {
    return (t1, t2) => ticketsOrdering.indexOf(t1.id) - ticketsOrdering.indexOf(t2.id);
  }

  function moveTicketBefore(id: string) {
    ticketsOrdering = ticketsOrdering.filter((t) => t !== movingTicketId);
    ticketsOrdering = [
      ...ticketsOrdering.slice(0, ticketsOrdering.indexOf(id) - 1),
      movingTicketId,
      ...ticketsOrdering.slice(ticketsOrdering.indexOf(id)),
    ];
  }

  function moveTicketAfter(id: string) {
    ticketsOrdering = ticketsOrdering.filter((t) => t !== movingTicketId);
    ticketsOrdering = [
      ...ticketsOrdering.slice(0, ticketsOrdering.indexOf(id)),
      movingTicketId,
      ...ticketsOrdering.slice(ticketsOrdering.indexOf(id) + 1),
    ];
  }

  $: ticketsByGroup = [
    ['', tickets.filter((t) => !t.ticketGroupId).sort(compareTickets(ticketsOrdering))],
    ...ticketGroups.map((g) => [
      g.id,
      tickets.filter((t) => t.ticketGroupId === g.id).sort(compareTickets(ticketsOrdering)),
    ]),
  ] as [string, Ticket[]][];

  $: tickets.sort((a, b) => ticketsOrdering.indexOf(a.id) - ticketsOrdering.indexOf(b.id));

  $: hasGroups = ticketGroups.length > 0;
</script>

<ul class="tickets">
  <li class="new-group">
    <button
      class="new group"
      type="button"
      on:click={() => {
        let group = {
          id: shadowId(),
          capacity: 0,
          name: '',
        };
        ticketGroups = [...ticketGroups, group];
      }}>Nouveau groupe de billet</button
    >
  </li>
  {#each ticketsByGroup as [groupId, ticketsOfGroup] (groupId)}
    {@const group = ticketGroups.find((g) => g.id === groupId)}
    {#if group}
      <li class="group">
        <InputText
          inline
          label=""
          bind:value={ticketGroups[ticketGroups.findIndex((g) => g.id === groupId)].name}
          placeholder="Groupe sans nom"
        />
        &middot;
        <InputNumber
          inline
          label=""
          bind:value={ticketGroups[ticketGroups.findIndex((g) => g.id === groupId)].capacity}
        />
        places
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
          console.log('dragstart');
          movingTicketId = ticket.id;
        }}
        on:dragover={() => {
          console.log('dragover');
          // if dragging over moving ticket, do nothing
          if (movingTicketId === ticket.id) return;
          console.dir(
            {
              current: {
                this: ticketsOrdering.indexOf(ticket.id),
                moving: ticketsOrdering.indexOf(movingTicketId),
              },
              before: {
                this: ticketsOrderingBeforeDragStart.indexOf(ticket.id),
                moving: ticketsOrderingBeforeDragStart.indexOf(movingTicketId),
              },
            },
            { depth: undefined },
          );
          if (
            ticketsOrdering.indexOf(ticket.id) === ticketsOrdering.length - 1 &&
            ticketsOrderingBeforeDragStart.indexOf(movingTicketId) <
              ticketsOrderingBeforeDragStart.indexOf(ticket.id)
          ) {
            // if this ticket is the last, move it after the last
            ticketsOrdering = ticketsOrdering.filter((t) => t !== movingTicketId);
            ticketsOrdering = [...ticketsOrdering, movingTicketId];
          } else {
            // Move moving ticket before this ticket only if moving ticket was before this ticket before dragging started
            moveTicketBefore(ticket.id);
          }
        }}
        on:dragend={() => {
          console.log('dragend');
          movingTicketId = '';
          ticketsOrderingBeforeDragStart = structuredClone(ticketsOrdering);
        }}
        on:drop={() => {
          console.log('drop');
          movingTicketId = '';
        }}
      >
        <button
          on:click={() => {
            if (expandedTicketId === ticket.id) expandedTicketId = '';
            else expandedTicketId = ticket.id;
          }}
          class:highlighted={ticket.id === expandedTicketId}
          class:dragging={ticket.id === movingTicketId}
          class:indented={hasGroups}
          class="ticket"
          type="button"
        >
          {ticket.name}
        </button>
      </div>
    {/each}
    <li class="new">
      <button
        class:indented={hasGroups}
        class="new ticket"
        type="button"
        on:dragend={() => {
          movingTicketId = '';
          ticketsOrderingBeforeDragStart = structuredClone(ticketsOrdering);
        }}
        on:dragover={() => {
          // Move moving ticket to this group if it's not the moving ticket's current group
          const movingTicket = tickets.find((t) => t.id === movingTicketId);
          if (!movingTicket) return;
          if (groupId === movingTicket.ticketGroupId) {
            moveTicketAfter(
              Object.fromEntries(ticketsByGroup)
                [groupId ?? ''].sort(compareTickets(ticketsOrdering))
                .reverse()[0].id,
            );
          } else {
            tickets[tickets.findIndex((t) => t.id === movingTicketId)].ticketGroupId =
              groupId || undefined;
          }
        }}
        on:click={() => {
          let newTicket = defaultTicket({ tickets, startsAt, endsAt }, shadowId());
          if (groupId) newTicket.ticketGroupId = groupId;
          tickets = [...tickets, newTicket];
          ticketsOrdering = [...ticketsOrdering, newTicket.id];
          expandedTicketId = newTicket.id;
        }}
        >Nouveau billet {#if group}
          dans {group.name || 'groupe sans nom'}{/if}</button
      >
    </li>
  {/each}
</ul>
<section class="editing-ticket">
  {#if expandedTicketId}
    <div class="editing-ticket-transition-wrapper" transition:fly={{ duration: 50, x: 50 }}>
      <FormTicketBeta
        bind:ticket={tickets[tickets.findIndex((t) => t.id === expandedTicketId)]}
        on:save={({ detail: ticket }) => {
          expandedTicketId = '';
          dispatch('save', ticket);
        }}
        on:delete={({ detail: ticket }) => {
          expandedTicketId = '';
          tickets = tickets.filter((t) => t.id !== ticket.id);
          dispatch('save', ticket);
        }}
      ></FormTicketBeta>
    </div>
  {/if}
</section>

<style>
  .editing-ticket {
    width: 400px;
  }

  .tickets {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    list-style: none;
    width: 300px;
  }

  .ticket {
    background-color: var(--muted-bg);
    padding: 1rem;
    border-radius: var(--radius-block);
    box-shadow: none;
    border: none;
    border: var(--border-block) solid transparent;
    cursor: pointer;
    width: 100%;
  }
  .ticket.new {
    border: var(--border-block) dashed var(--border);
    background: transparent;
  }
  .ticket.indented {
    margin-left: 2rem;
  }

  .ticket:hover {
    background-color: var(--hover-bg);
  }
  .ticket.highlighted {
    border-color: var(--primary-border);
  }
  .ticket.dragging {
    opacity: 0.5;
    background-color: color-mix(in srgb, var(--primary-bg) 15%, transparent);
  }

  .ticket-draggable-wrapper {
    width: 100%;
  }
</style>
