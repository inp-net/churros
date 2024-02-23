export const placesLeft = (ticket: {
  name: string;
  capacity: number;
  registrations: Array<{ paid: boolean; opposedAt: Date | null; cancelledAt: Date | null }>;
  group: null | {
    capacity: number;
    tickets: Array<{
      registrations: Array<{ paid: boolean; opposedAt: Date | null; cancelledAt: Date | null }>;
    }>;
  };
}) => {
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
            registrations.filter(
              ({ opposedAt, cancelledAt /* , paid */ }) => !cancelledAt && !opposedAt /* && paid */,
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
        ticket.registrations.filter(
          ({ opposedAt, cancelledAt /* , paid */ }) => !cancelledAt && !opposedAt /* && paid */,
        ).length,
    );
  }

  return Math.min(placesLeftInGroup, placesLeftInTicket);
};
