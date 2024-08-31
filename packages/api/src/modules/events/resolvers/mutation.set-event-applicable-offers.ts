import { builder, ensureGlobalId, prisma } from '#lib';
import { EventType } from '#modules/events/types';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events/utils';
import { LocalID } from '#modules/global';
import { PromotionTypeEnum } from '#modules/payments';
import { GraphQLError } from 'graphql';

builder.mutationField('setEventApplicableOffers', (t) =>
  t.prismaField({
    type: EventType,
    errors: {},
    description: 'Définir les promotions applicables pour cet évènement.',
    args: {
      event: t.arg({ type: LocalID }),
      offers: t.arg({ type: [PromotionTypeEnum] }),
    },
    async authScopes(_, args, { user }) {
      return canEditEvent(
        await prisma.event.findUniqueOrThrow({
          where: { id: ensureGlobalId(args.event, 'Event') },
          include: canEditEventPrismaIncludes,
        }),
        user,
      );
    },
    async resolve(query, _, args) {
      const offers = await prisma.promotion.findMany({
        where: {
          type: { in: args.offers },
        },
      });

      if (offers.length === 0 && args.offers.length > 0) {
        throw new GraphQLError(
          "Aucune promotion disponible pour les types de promotion sélectionnés. Demande à l'équipe administrative de créer des promotions.",
        );
      }

      return prisma.event.update({
        ...query,
        where: { id: ensureGlobalId(args.event, 'Event') },
        data: {
          applicableOffers: {
            set: offers.map((o) => ({ id: o.id })),
          },
        },
      });
    },
  }),
);
