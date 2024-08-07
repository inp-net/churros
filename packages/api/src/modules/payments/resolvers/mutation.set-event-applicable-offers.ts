import { builder, ensureGlobalId, lastElement, log, prisma } from '#lib';
import { canEditEvent, canEditEventPrismaIncludes, EventType } from '#modules/events';
import { LocalID } from '#modules/global';
import { PromotionTypeEnum } from '#modules/payments/types';
import { ZodError } from 'zod';

builder.mutationField('setEventApplicableOffers', (t) =>
  t.prismaField({
    type: EventType,
    errors: { types: [Error, ZodError] },
    args: {
      event: t.arg({ type: LocalID }),
      applicableOffers: t.arg({
        // TODO: rename promotions to special offers everywhere and expose Query.specialOffers, and accept IDs to promotions here
        type: [PromotionTypeEnum],
        description:
          "Liste d'identifiants de promotions applicables à tout les billets de l'évènement",
      }),
    },
    async authScopes(_, args, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id: ensureGlobalId(args.event, 'Event') },
        include: canEditEventPrismaIncludes,
      });
      return canEditEvent(event, user);
    },
    async resolve(query, _, args, { user }) {
      const id = ensureGlobalId(args.event, 'Event');
      await log('payments', 'event/set-applicable-offers', { args }, id, user);
      const allOffers = await prisma.promotion.findMany({
        select: { id: true, type: true },
      });
      const tickets = await prisma.ticket.findMany({
        where: { eventId: id },
        select: { id: true },
      });

      const results = await prisma.$transaction([
        ...(args.applicableOffers
          ? allOffers.map((offer) =>
              prisma.promotion.update({
                where: { id: offer.id },
                data: {
                  validOn: {
                    [args.applicableOffers!.includes(offer.type) ? 'connect' : 'disconnect']:
                      tickets.map((ticket) => ({ id: ticket.id })),
                  },
                },
              }),
            )
          : []),
        prisma.event.findUniqueOrThrow({
          ...query,
          where: { id },
        }),
      ]);
      return lastElement(results);
    },
  }),
);
