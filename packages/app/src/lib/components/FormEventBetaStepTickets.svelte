<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fly } from 'svelte/transition';
  import IconDelete from '~icons/mdi/delete-outline';
  import IconAdd from '~icons/mdi/plus';
  import ButtonGhost from './ButtonGhost.svelte';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import { defaultTicket, shadowId, type Ticket } from './FormEventBeta.svelte';
  import FormTicketBeta from './FormTicketBeta.svelte';
  import InputNumber from './InputNumber.svelte';
  import InputText from './InputText.svelte';
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
  ] as Array<[string, Ticket[]]>;

  $: tickets.sort((a, b) => ticketsOrdering.indexOf(a.id) - ticketsOrdering.indexOf(b.id));

  $: hasGroups = ticketGroups.length > 0;

  function handleShortcuts(event: KeyboardEvent) {
    if (event.key === 'ArrowUp' || event.key === 'K')
      expandedTicketId = tickets[tickets.findIndex((t) => t.id === expandedTicketId) - 1]?.id;
  }
</script>

<svelte:window on:keypress={handleShortcuts} />

<ul class="tickets">
  {#each ticketsByGroup as [groupId, ticketsOfGroup] (groupId)}
    {@const group = ticketGroups.find((g) => g.id === groupId)}
    {#if group}
      <li class="group">
        <div class="data">
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
          place{#if group.capacity > 1}s{/if}
        </div>
        <ButtonGhost
          danger
          type="button"
          on:click={() => {
            tickets = tickets.filter((t) => t.ticketGroupId !== groupId);
            ticketGroups = ticketGroups.filter((g) => g.id !== groupId);
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
          movingTicketId = ticket.id;
        }}
        on:dragenter={() => {
          // if dragging over moving ticket, do nothing
          if (movingTicketId === ticket.id) return;
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
          movingTicketId = '';
          ticketsOrderingBeforeDragStart = structuredClone(ticketsOrdering);
        }}
        on:drop={() => {
          movingTicketId = '';
        }}
      >
        <button
          on:click={() => {
            expandedTicketId = expandedTicketId === ticket.id ? '' : ticket.id;
          }}
          class:highlighted={ticket.id === expandedTicketId}
          class:dragging={ticket.id === movingTicketId}
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
          movingTicketId = '';
          ticketsOrderingBeforeDragStart = structuredClone(ticketsOrdering);
        }}
        on:drop={() => {
          movingTicketId = '';
          ticketsOrderingBeforeDragStart = structuredClone(ticketsOrdering);
        }}
        on:dragenter={() => {
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
          const newTicket = defaultTicket({ tickets, startsAt, endsAt }, shadowId());
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
  <li class="new-group">
    <ButtonSecondary
      type="button"
      icon={IconAdd}
      on:click={() => {
        const group = {
          id: shadowId(),
          capacity: 0,
          name: '',
        };
        ticketGroups = [...ticketGroups, group];
      }}>Nouveau groupe de billet</ButtonSecondary
    >
  </li>
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

  .group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .group.none {
    color: var(--muted);
  }

  .tickets {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 400px;
    list-style: none;
  }

  .ticket {
    display: flex;
    flex-grow: 1;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 1rem 1.5rem;
    font-size: 1rem;
    cursor: pointer;
    background-color: var(--muted-bg);
    border: none;
    border: var(--border-block) solid transparent;
    border-radius: var(--radius-block);
    box-shadow: none;
    transition: margin 0.25s ease;
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

  .ticket.highlighted {
    border-color: var(--primary-border);
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
