import { ensureGlobalId, prisma } from '#lib';
import type { Prisma, Ticket } from '@churros/db/prisma';
import { compareAsc, isFuture, isWithinInterval } from 'date-fns';

export async function getTicketsWithConstraints(
  eventId: string,
  query: {
    include?: Prisma.TicketInclude;
    select?: Prisma.TicketSelect;
  } = {},
) {
  return await prisma.ticket.findMany({
    ...query,
    where: { eventId },
    include: {
      openToGroups: true,
      openToSchools: true,
      openToMajors: true,
      event: {
        include: {
          managers: { include: { user: true } },
          bannedUsers: true,
          group: {
            include: {
              studentAssociation: true,
            },
          },
        },
      },
    },
  });
}

export function ticketHasShotgunSet(t: Ticket): t is typeof t & { opensAt: Date; closesAt: Date } {
  return t.opensAt !== null && t.closesAt !== null;
}

export function shotgunIsOpen(t: Ticket): boolean {
  return (
    ticketHasShotgunSet(t) &&
    isWithinInterval(new Date(), {
      start: t.opensAt,
      end: t.closesAt,
    })
  );
}

/**
 * Compares two tickets. Sorts by shotgun open status (open tickets first), then by price (cheapest first) when open, or by time until opening when closed (if opening time is in the future), or by time since closed (if opening time is in the past).
 */
export function ticketsByShotgunSorter(a: Ticket, b: Ticket) {
  // Tickets without dates are last
  if (!ticketHasShotgunSet(a) && ticketHasShotgunSet(b)) return 1;
  if (ticketHasShotgunSet(a) && !ticketHasShotgunSet(b)) return -1;
  if (!ticketHasShotgunSet(a) || !ticketHasShotgunSet(b)) return 0;

  // Prioritize open tickets
  if (shotgunIsOpen(a) && !shotgunIsOpen(b)) return -1;
  if (!shotgunIsOpen(a) && shotgunIsOpen(b)) return 1;

  // Sort by price when open
  if (shotgunIsOpen(a) && shotgunIsOpen(b)) return a.minimumPrice - b.minimumPrice;

  // Prioritize tickets that open in the future
  if (isFuture(a.opensAt) && !isFuture(b.opensAt)) return -1;
  if (!isFuture(a.opensAt) && isFuture(b.opensAt)) return 1;

  // Sort by soonest to open
  if (isFuture(a.opensAt) && isFuture(b.opensAt)) return compareAsc(a.opensAt, b.opensAt);

  // Sort by soonest to have closed
  return compareAsc(a.closesAt, b.closesAt);
}

export async function ticketCanBeSafelyDeleted(ticketId: string) {
  return prisma.registration
    .count({
      where: { ticketId: ensureGlobalId(ticketId, 'Ticket') },
    })
    .then((count) => count <= 0);
}

/**
 * Return null if the capacity is Unlimited, else return the capacity.
 */
export function handleUnlimitedCapacity(cap: 'Unlimited'): null;
export function handleUnlimitedCapacity(cap: number): number;
export function handleUnlimitedCapacity(cap: number | 'Unlimited'): number | null;
export function handleUnlimitedCapacity(cap: 'Unlimited' | number): number | null {
  return cap === 'Unlimited' ? null : cap;
}
