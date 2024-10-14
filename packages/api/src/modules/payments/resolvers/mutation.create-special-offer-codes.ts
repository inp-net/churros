import { builder, ensureGlobalId, log, prisma } from '#lib';
import { LocalID } from '#modules/global';
import { GraphQLError } from 'graphql';
import { customAlphabet } from 'nanoid';
import { ZodError } from 'zod';
import { canCreateSpecialOfferCodes } from '../utils/permissions.js';

export const SPECIALOFFER_CODES_BULK_GENERATION_LIMIT = 500;
export const SPECIALOFFER_CODES_ALPHABET = 'ABCDEFGHJKLMNPQRTUVWXY34689';
const nanoid = customAlphabet(SPECIALOFFER_CODES_ALPHABET, 8);

builder.mutationField('createSpecialOfferCodes', (t) =>
  t.field({
    type: ['String'],
    description: 'Générer des codes de promotion pour une promotion',
    errors: {
      types: [Error, ZodError, SomeNotCreated],
    },
    args: {
      specialOffer: t.arg({
        type: LocalID,
      }),
      amount: t.arg.int({
        description: `Nombre de codes à générer. Maximum: ${SPECIALOFFER_CODES_BULK_GENERATION_LIMIT}`,
        validate: {
          min: 1,
          max: SPECIALOFFER_CODES_BULK_GENERATION_LIMIT,
        },
      }),
    },
    async authScopes(_, { specialOffer: id }, { user }) {
      const specialOffer = await prisma.promotion.findUniqueOrThrow({
        where: {
          id: ensureGlobalId(id, 'Promotion'),
        },
        include: canCreateSpecialOfferCodes.prismaIncludes,
      });
      return canCreateSpecialOfferCodes(user, specialOffer);
    },
    async resolve(_, { specialOffer: specialOfferId, amount }, { user }) {
      const id = ensureGlobalId(specialOfferId, 'Promotion');
      const specialOffer = await prisma.promotion.findUniqueOrThrow({
        where: { id },
      });
      await log('special-offers', 'generate-codes', { specialOffer, amount }, id, user);

      const codes = Array.from({ length: amount }).map(() => nanoid());

      const { count: createdCount } = await prisma.promotionCode.createMany({
        data: codes.map((code) => ({
          code,
          promotionId: id,
        })),
      });

      if (createdCount !== amount) throw new SomeNotCreated(createdCount);

      return codes;
    },
  }),
);

class SomeNotCreated extends GraphQLError {
  constructor(amountCreated: number) {
    super(`Seuls ${amountCreated} codes ont été créés`);
  }
}

builder.objectType(SomeNotCreated, {
  name: 'SomeNotCreatedError',
  fields: (t) => ({
    message: t.exposeString('message'),
  }),
});
