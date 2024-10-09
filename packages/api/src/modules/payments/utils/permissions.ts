import type { Context } from '#lib';
import { userIsAdminOf } from '#permissions';
import type { Prisma } from '@churros/db/prisma';

export function canCreateSpecialOfferCodes(
  user: Context['user'],
  promotion: Prisma.PromotionGetPayload<{
    include: typeof canCreateSpecialOfferCodes.prismaIncludes;
  }>,
) {
  if (!user) return false;
  if (user.admin) return true;

  return [...promotion.validOn.flatMap((t) => t.event), ...promotion.events].some((event) =>
    userIsAdminOf(user, event.group.studentAssociationId),
  );
}

canCreateSpecialOfferCodes.prismaIncludes = {
  events: {
    include: {
      group: true,
    },
  },
  validOn: {
    include: {
      event: {
        include: {
          group: true,
        },
      },
    },
  },
} as const satisfies Prisma.PromotionInclude;
