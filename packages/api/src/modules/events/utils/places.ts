import type { Ticket, TicketGroup } from '@prisma/client';

export function eventCapacity(
  tickets: Array<Ticket & { group: TicketGroup | null }>,
  ticketGroups: Array<TicketGroup & { tickets: Ticket[] }>,
) {
  // Places left is capacity - number of registrations
  // Capacity is the sum of
  // - ticket's capacity, for tickets outside of groups
  // - min(group capacity, sum of tickets' capacity)  for ticket groups
  const ungroupedTickets = tickets.filter((t) => !t.group);
  const handleUnlimited = (capacity: number) =>
    capacity === -1 ? Number.POSITIVE_INFINITY : capacity;
  return (
    ungroupedTickets.reduce((acc, t) => acc + handleUnlimited(t.capacity), 0) +
    ticketGroups.reduce(
      (acc, tg) =>
        acc +
        Math.min(
          handleUnlimited(tg.capacity),
          tg.tickets.reduce((acc, t) => acc + handleUnlimited(t.capacity), 0),
        ),
      0,
    )
  );
}
