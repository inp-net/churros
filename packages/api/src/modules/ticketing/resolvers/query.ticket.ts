import { builder, ensureGlobalId, prisma } from '#lib';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events';
import { LocalID } from '#modules/global';
import {
  canSeeTicket,
  canSeeTicketPrismaIncludes,
  canSeeTicketPrismaIncludesForUser,
} from '#modules/ticketing';
import { TicketType } from '#modules/ticketing/types';

builder.queryField('ticket', (t) =>
  t.prismaField({
    type: TicketType,
    args: {
      id: t.arg({ type: LocalID }),
    },
    async authScopes(_, { id }, { user }) {
      // Performance optimization: if the user can edit the event, they can see the ticket. And this query will be almost exclusively used for Houdini List Fragments, which will only be viewed on the admin event page
      const event = await prisma.ticket
        .findUniqueOrThrow({
          where: { id: ensureGlobalId(id, 'Ticket') },
        })
        .event({
          include: canEditEventPrismaIncludes,
        });
      if (canEditEvent(event, user)) return true;

      const ticket = await prisma.ticket.findUniqueOrThrow({
        where: { id: ensureGlobalId(id, 'Ticket') },
        include: canSeeTicketPrismaIncludes,
      });

      const userAdditionalData = user
        ? await prisma.user.findUniqueOrThrow({
            where: { id: user.id },
            include: canSeeTicketPrismaIncludesForUser,
          })
        : null;
      return canSeeTicket(ticket, userAdditionalData);
    },
    async resolve(query, _, { id }) {
      return prisma.ticket.findUniqueOrThrow({
        ...query,
        where: { id: ensureGlobalId(id, 'Ticket') },
      });
    },
  }),
);
