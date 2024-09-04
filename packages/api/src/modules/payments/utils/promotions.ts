import { clamp, type Context } from '#lib';
import type { Prisma, User } from '@churros/db/prisma';
import { isPast } from 'date-fns';

/**
 * Returns the actual price of the ticket for a user, taking into account any promotions they have claimed.
 * @param user the user that wants to pay the ticket
 * @param ticket the ticket to pay for
 * @returns the price the user has to pay
 */
export function actualPrice(
  user: Context['user'] | User,
  ticket: Prisma.TicketGetPayload<{
    include: typeof actualPrice.prismaIncludes;
  }>,
  amount: number | null,
) {
  if (!user) return clamp(amount ?? ticket.minimumPrice, ticket.minimumPrice, ticket.maximumPrice);

  const offer = ticket.event.applicableOffers.find((offer) => {
    // Promotion is expired
    if (offer.validUntil && isPast(offer.validUntil)) return false;
    // Not claimed by user
    if (!offer.codes.some((code) => code.claimedById === user.id)) return false;
    return true;
  });

  const actualMinimum = Math.min(offer?.priceOverride ?? ticket.minimumPrice, ticket.minimumPrice);

  return clamp(amount ?? actualMinimum, actualMinimum, ticket.maximumPrice);
}

actualPrice.prismaIncludes = {
  event: {
    include: {
      applicableOffers: {
        include: {
          validOn: true,
          codes: true,
        },
      },
    },
  },
} as const satisfies Prisma.TicketInclude;
