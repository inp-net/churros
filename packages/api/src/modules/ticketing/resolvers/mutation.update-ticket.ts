import { builder, ensureGlobalId, log, prisma } from '#lib';
import { canEditEvent, canEditEventPrismaIncludes, CapacityScalar } from '#modules/events';
import { DateRangeInput, LocalID } from '#modules/global';
import { PaymentMethodEnum } from '#modules/payments';
import { TicketType } from '#modules/ticketing/types';
import { handleUnlimitedCapacity } from '#modules/ticketing/utils';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';
import { TicketCountingPolicyEnum } from '../types/ticket-counting-policy.js';

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
        description: 'Prix en euros du billet. Met à jour les prix minimum et maximum',
      }),
      minimumPrice: t.arg.float({
        required: false,
        validate: { min: 0 },
        description: 'Prix minimum en euros du billet',
      }),
      maximumPrice: t.arg.float({
        required: false,
        validate: { min: 0 },
        description: 'Prix maximum en euros du billet',
      }),
      capacity: t.arg({ required: false, type: CapacityScalar }),
      godsonLimit: t.arg.int({
        required: false,
        description: 'Nombre maximum de parrainages par billet (0 pour désactiver les parrainages)',
      }),
      allowedPaymentMethods: t.arg({
        required: false,
        type: [PaymentMethodEnum],
        description: 'Moyens de paiement acceptés pour ce billet',
      }),
      countingPolicy: t.arg({
        type: TicketCountingPolicyEnum,
        defaultValue: 'OnBooked',
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

      if (args.allowedPaymentMethods?.includes('Lydia')) {
        const { lydiaAccountId } = await prisma.ticket
          .findUniqueOrThrow({
            where: { id },
          })
          .event({
            select: {
              lydiaAccountId: true,
            },
          });
        if (!lydiaAccountId) {
          throw new GraphQLError(
            "Impossible d'accepter Lydia comme moyen de paiement: l'événement n'a pas de compte Lydia associé",
          );
        }
      }

      return prisma.ticket.update({
        ...query,
        where: { id },
        data: {
          opensAt: args.shotgun?.start,
          closesAt: args.shotgun?.end,
          name: args.name ?? undefined,
          minimumPrice: args.price ?? args.minimumPrice ?? undefined,
          maximumPrice: args.price ?? args.maximumPrice ?? undefined,
          capacity: args.capacity ? handleUnlimitedCapacity(args.capacity) : undefined,
          godsonLimit: args.godsonLimit ?? undefined,
          allowedPaymentMethods: args.allowedPaymentMethods
            ? { set: args.allowedPaymentMethods }
            : undefined,
          countingPolicy: args.countingPolicy,
        },
      });
    },
  }),
);
