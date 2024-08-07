import type { Prisma } from '@churros/db/prisma';

export function eventCapacity({
  tickets,
  ticketGroups,
  globalCapacity,
}: Prisma.EventGetPayload<{ include: typeof eventCapacity.prismaIncludes }>) {
  // Places left is capacity - number of registrations
  // Capacity is the sum of
  // - ticket's capacity, for tickets outside of groups
  // - min(group capacity, sum of tickets' capacity)  for ticket groups
  const ungroupedTickets = tickets.filter((t) => !t.group);
  const handleUnlimited = (capacity: number | null) =>
    capacity === null || capacity < 0 ? Number.POSITIVE_INFINITY : capacity;
  return Math.min(
    handleUnlimited(globalCapacity),
    ungroupedTickets.reduce((acc, t) => acc + handleUnlimited(t.capacity), 0) +
      ticketGroups.reduce(
        (acc, tg) =>
          acc +
          Math.min(
            handleUnlimited(tg.capacity),
            tg.tickets.reduce((acc, t) => acc + handleUnlimited(t.capacity), 0),
          ),
        0,
      ),
  );
}

eventCapacity.prismaIncludes = {
  tickets: { include: { group: true } },
  ticketGroups: { include: { tickets: true } },
} as const satisfies Prisma.EventInclude;
