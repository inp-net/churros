import { prisma } from '#lib';

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
