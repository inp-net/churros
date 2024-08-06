import { builder, ensureGlobalId, log, prisma } from '#lib';
import { canEditEvent, canEditEventPrismaIncludes, CapacityScalar } from '#modules/events';
import { DateRangeInput, LocalID } from '#modules/global';
import { PromotionTypeEnum } from '#modules/payments';
import { TicketType } from '#modules/ticketing/types';
import { handleUnlimitedCapacity } from '#modules/ticketing/utils';
import { ZodError } from 'zod';

builder.mutationField('updateTicket', (t) =>
  t.prismaField({
    type: TicketType,
    errors: { types: [Error, ZodError] },
    description: 'Mettre à jour un billet',
    args: {
      ticket: t.arg({ type: LocalID }),
      shotgun: t.arg({ type: DateRangeInput, required: false }),
      name: t.arg.string({ required: false }),
      price: t.arg.float({
        required: false,
        validate: { min: 0 },
        description: 'Prix en euros du billet',
      }),
      capacity: t.arg({ required: false, type: CapacityScalar }),
      applicableOffers: t.arg({
        required: false,
        type: [PromotionTypeEnum],
        description: 'Promotions applicables au billet',
      }),
      godsonLimit: t.arg.int({
        required: false,
        description: 'Nombre maximum de parrainages par billet (0 pour désactiver les parrainages)',
      }),
    },
    async authScopes(_, { ticket: ticketId }, { user }) {
      const event = await prisma.ticket
        .findUniqueOrThrow({
          where: { id: ensureGlobalId(ticketId, 'Ticket') },
        })
        .event({
          include: canEditEventPrismaIncludes,
        });
      return canEditEvent(event, user);
    },
    async resolve(query, _, args, { user }) {
      const id = ensureGlobalId(args.ticket, 'Ticket');
      await log('ticketing', 'update-ticket', args, id, user);
      const allOffers = await prisma.promotion.findMany();

      return prisma.ticket.update({
        ...query,
        where: { id },
        data: {
          opensAt: args.shotgun?.start,
          closesAt: args.shotgun?.end,
          name: args.name ?? undefined,
          price: args.price ?? undefined,
          capacity: args.capacity ? handleUnlimitedCapacity(args.capacity) : undefined,
          subjectToPromotions: args.applicableOffers
            ? {
                set: allOffers
                  .filter((o) => args.applicableOffers?.includes(o.type))
                  .map((o) => ({ id: o.id })),
              }
            : undefined,
          godsonLimit: args.godsonLimit ?? undefined,
        },
      });
    },
  }),
);
