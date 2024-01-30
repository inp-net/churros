import { builder, prisma } from '#lib';

import { PromotionType } from '@prisma/client';
import { isFuture } from 'date-fns';
import { GraphQLError } from 'graphql';

builder.mutationField('claimPromotionCode', (t) =>
  t.boolean({
    args: {
      code: t.arg.string({ validate: { minLength: 1 } }),
    },
    authScopes: { student: true },
    async resolve(_, { code }, { user }) {
      code = code.toUpperCase().trim();
      if (!user) throw new GraphQLError('Tu dois être connecté');

      const promotion = await prisma.promotion.findFirst({
        where: { codes: { some: { code } } },
      });
      if (!promotion) throw new GraphQLError(`Code ${code} invalide`);

      // If it's a SIMPPS promo code, check if the user has not already claimed one that's still valid
      if (
        user &&
        promotion.type === PromotionType.SIMPPS &&
        (!promotion.validUntil || isFuture(promotion.validUntil)) &&
        (await prisma.promotionCode.count({
          where: {
            code: { not: code },
            claimedBy: { id: user.id },
            promotion: { id: promotion.id },
          },
        }))
      ) {
        throw new GraphQLError(
          `Tu as déjà un code SIMPPS valide, pas besoin de réclamer ${code} ;)`,
        );
      }

      // Check if the code was not already claimed
      const promotionCode = await prisma.promotionCode.findUnique({
        where: { code },
        include: { claimedBy: true },
      });
      if (!promotionCode) throw new GraphQLError(`Le code "${code}" n'est pas valide`);

      if (promotionCode.claimedBy && promotionCode.claimedBy?.id !== user.id)
        throw new GraphQLError(`Le code "${code}" a déjà été utilisé par quelqu'un d'autre`);

      // Claim the code
      try {
        await prisma.promotionCode.update({
          where: { code },
          data: {
            claimedBy: {
              connect: {
                id: user.id,
              },
            },
            claimedAt: new Date(),
          },
        });
      } catch (error: unknown) {
        console.error(`Could not redeem ${code}: ${error?.toString() ?? '(unknown)'}`);
        throw new GraphQLError(`Le code "${code}" n'est pas valide`);
      }

      return true;
    },
  }),
);
