<script lang="ts">
  import { toasts } from '$lib/toasts';
  import { fly } from 'svelte/transition';
  import ButtonPrimary from './ButtonPrimary.svelte';
  import { defaultTicket, shadowId, type Ticket } from './FormEventBeta.svelte';
  import FormTicketBeta from './FormTicketBeta.svelte';

  export let tickets: Ticket[];
  export let ticketGroups: Array<{ id: string; name: string; capacity: number; tickets: Ticket[] }>;

  export let startsAt: Date | undefined = undefined;
  export let endsAt: Date | undefined = undefined;

  let expandedTicketId = '';
  let movingTicketId = '';

  // list of IDs
  let ticketsOrdering = tickets.map((t) => t.id);
  let ticketsOrderingBeforeDragStart = structuredClone(ticketsOrdering);

  $: ticketsById = new Map(tickets.map((t) => [t.id, t]));
  $: tickets.sort((a, b) => ticketsOrdering.indexOf(a.id) - ticketsOrdering.indexOf(b.id));
</script>

<ul class="tickets">
  {#each tickets as ticket (ticket.id)}
    <div
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
          ticketsOrdering = ticketsOrdering.filter((t) => t !== movingTicketId);
          ticketsOrdering = [
            ...ticketsOrdering.slice(0, ticketsOrdering.indexOf(ticket.id) - 1),
            movingTicketId,
            ...ticketsOrdering.slice(ticketsOrdering.indexOf(ticket.id)),
          ];
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
        class="ticket"
        type="button"
      >
        {ticket.name}
      </button>
    </div>
  {/each}

  <li class="new">
    <ButtonPrimary
      smaller
      on:click={() => {
        let newTicket = defaultTicket({ tickets, startsAt, endsAt }, shadowId());
        tickets = [...tickets, newTicket];
        ticketsOrdering = [...ticketsOrdering, newTicket.id];
        expandedTicketId = newTicket.id;
      }}>Nouveau billet</ButtonPrimary
    >
  </li>
</ul>
<section class="new-ticket">
  {#if expandedTicketId}
    <div class="new-ticket-transition-wrapper" transition:fly={{ duration: 50, x: 50 }}>
      <FormTicketBeta
        bind:ticket={tickets[tickets.findIndex((t) => t.id === expandedTicketId)]}
        on:save={({ detail: ticket }) => {
          toasts.success('Modifications sauvegardées');
        }}
      ></FormTicketBeta>
    </div>
  {/if}
</section>

<style>
  .new-ticket {
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
