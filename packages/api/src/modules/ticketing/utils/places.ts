import type { Prisma } from '@churros/db/prisma';

export function placesLeft(
  ticket: Prisma.TicketGetPayload<{ include: typeof placesLeft.prismaIncludes }>,
) {
  const handleUnlimited = (capacity: number) =>
    capacity === -1 ? Number.POSITIVE_INFINITY : capacity;
  let placesLeftInGroup = Number.POSITIVE_INFINITY;
  if (ticket.group?.capacity) {
    placesLeftInGroup = Math.max(
      0,
      handleUnlimited(ticket.group.capacity) -
        ticket.group.tickets.reduce(
          (sum, { registrations }) =>
            sum +
            registrations.filter((booking) =>
              bookingCounts({
                ...booking,
                ticket,
              }),
            ).length,
          0,
        ),
    );
  }

  let placesLeftInTicket = Number.POSITIVE_INFINITY;
  if (ticket.capacity) {
    placesLeftInTicket = Math.max(
      0,
      handleUnlimited(ticket.capacity) -
        ticket.registrations.filter((booking) =>
          bookingCounts({
            ...booking,
            ticket,
          }),
        ).length,
    );
  }

  let placesLeftInEvent = Number.POSITIVE_INFINITY;
  if (ticket.event.globalCapacity) {
    placesLeftInEvent = Math.max(
      0,
      handleUnlimited(ticket.event.globalCapacity) -
        ticket.event.tickets.reduce(
          (sum, { registrations }) =>
            sum +
            registrations.filter((booking) =>
              bookingCounts({
                ...booking,
                ticket,
              }),
            ).length,
          0,
        ),
    );
  }

  return Math.min(placesLeftInGroup, placesLeftInTicket, placesLeftInEvent);
}

placesLeft.prismaIncludes = {
  group: {
    include: {
      tickets: {
        include: {
          registrations: true,
        },
      },
    },
  },
  registrations: true,
  event: {
    include: {
      tickets: {
        include: {
          registrations: true,
        },
      },
    },
  },
} as const satisfies Prisma.TicketInclude;

function bookingCounts(
  booking: Prisma.RegistrationGetPayload<{ include: typeof bookingCounts.prismaIncludes }>,
) {
  switch (booking.ticket.countingPolicy) {
    case 'OnBooked': {
      return !booking.cancelledAt && !booking.opposedAt;
    }

    case 'OnPaid': {
      return booking.paid && !booking.cancelledAt && !booking.opposedAt;
    }

    default: {
      throw new Error(`Unexpected ticket counting policy: ${booking.ticket.countingPolicy}`);
    }
  }
}

bookingCounts.prismaIncludes = {
  ticket: true,
} as const satisfies Prisma.RegistrationInclude;
