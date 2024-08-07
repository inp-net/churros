import { builder, ensureGlobalId, prisma } from '#lib';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events';
import { LocalID } from '#modules/global';
import {
  canSeeTicket,
  canSeeTicketPrismaIncludes,
  canSeeTicketPrismaIncludesForUser,
  TicketGroupType,
} from '../index.js';

builder.queryField('ticketGroup', (t) =>
  t.prismaField({
    type: TicketGroupType,
    args: {
      id: t.arg({ type: LocalID }),
    },
    async authScopes(_, { id }, { user }) {
      // Performance optimization: if the user can edit the event, they can see the ticket. And this query will be almost exclusively used for Houdini List Fragments, which will only be viewed on the admin event page
      const event = await prisma.ticketGroup
        .findUniqueOrThrow({
          where: { id: ensureGlobalId(id, 'TicketGroup') },
        })
        .event({
          include: canEditEventPrismaIncludes,
        });
      if (canEditEvent(event, user)) return true;

      const tickets = await prisma.ticketGroup
        .findUniqueOrThrow({
          where: { id: ensureGlobalId(id, 'TicketGroup') },
        })
        .tickets({
          include: canSeeTicketPrismaIncludes,
        });

      const userAdditionalData = user
        ? await prisma.user.findUniqueOrThrow({
            where: { id: user.id },
            include: canSeeTicketPrismaIncludesForUser,
          })
        : null;
      return tickets.some((ticket) => canSeeTicket(ticket, userAdditionalData));
    },
    async resolve(query, _, { id }) {
      return prisma.ticketGroup.findUniqueOrThrow({
        ...query,
        where: { id: ensureGlobalId(id, 'TicketGroup') },
      });
    },
  }),
);
