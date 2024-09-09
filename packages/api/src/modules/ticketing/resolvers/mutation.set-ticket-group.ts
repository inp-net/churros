import { builder, ensureGlobalId, log, prisma } from '#lib';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events';
import { LocalID } from '#modules/global';
import { TicketType } from '#modules/ticketing/types';

builder.mutationField('setTicketGroup', (t) =>
  t.prismaField({
    type: TicketType,
    errors: {},
    description: "Définir le groupe d'un billet",
    args: {
      ticket: t.arg({ type: LocalID }),
      group: t.arg({
        type: LocalID,
        required: false,
        description:
          'Le groupe de billet dans lequel mettre ce billet. Null pour le retirer de tout groupe.',
      }),
    },
    async authScopes(_, { ticket: ticketId }, { user }) {
      return canEditEvent(
        await prisma.ticket
          .findUniqueOrThrow({
            where: { id: ensureGlobalId(ticketId, 'Ticket') },
          })
          .event({
            include: canEditEventPrismaIncludes,
          }),
        user,
      );
    },
    async resolve(query, _, args, { user }) {
      await log('ticketing', 'set-ticket-group', args, args.ticket, user);

      return prisma.ticket.update({
        ...query,
        where: { id: ensureGlobalId(args.ticket, 'Ticket') },
        data: {
          group: args.group
            ? {
                connect: { id: ensureGlobalId(args.group, 'TicketGroup') },
              }
            : {
                disconnect: true,
              },
        },
      });
    },
  }),
);
