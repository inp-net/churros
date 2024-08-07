import { prisma, type Context } from '#lib';
import type { Prisma } from '@churros/db/prisma';
import { isPast } from 'date-fns';

export async function priceWithPromotionsApplied(
  ticket: { price: number; id: string },
  user: { id: string } | undefined,
) {
  if (!user) return ticket.price;
  const promotionCode = await prisma.promotionCode.findFirst({
    where: {
      claimedBy: {
        id: user.id,
      },
      promotion: {
        validUntil: {
          gte: new Date(),
        },
        validOn: {
          some: { id: ticket.id },
        },
      },
    },
    include: { promotion: true },
  });

  if (promotionCode && promotionCode.promotion.priceOverride < ticket.price)
    return promotionCode.promotion.priceOverride;
  return ticket.price;
}

/**
 * Returns the actual price of the ticket for a user, taking into account any promotions they have claimed.
 * @param user the user that wants to pay the ticket
 * @param ticket the ticket to pay for
 * @returns the price the user has to pay
 */
export function actualPrice(
  user: Context['user'],
  ticket: Prisma.TicketGetPayload<{
    include: typeof actualPrice.prismaIncludes;
  }>,
) {
  if (!user) return ticket.price;
  const offer = ticket.subjectToPromotions.find((offer) => {
    // Promotion is expired
    if (offer.validUntil && isPast(offer.validUntil)) return false;
    // Not claimed by user
    if (!offer.codes.some((code) => code.claimedById === user.id)) return false;
    return true;
  });
  if (offer && offer.priceOverride < ticket.price) return offer.priceOverride;
  return ticket.price;
}

actualPrice.prismaIncludes = {
  subjectToPromotions: {
    include: {
      validOn: true,
      codes: true,
    },
  },
} as const satisfies Prisma.TicketInclude;
