import { prisma } from '#lib';

export async function priceWithPromotionsApplied(
  ticket: { price: number; id: string; event: { id: string; group: { id: string } } },
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
        OR: [
          { validOnTickets: { some: { id: ticket.id } } },
          { validOnEvents: { some: { id: ticket.event.id } } },
          { validOnGroups: { some: { id: ticket.event.group.id } } },
        ],
      },
    },
    include: { promotion: true },
  });

  if (promotionCode && promotionCode.promotion.priceOverride < ticket.price)
    return promotionCode.promotion.priceOverride;
  return ticket.price;
}
