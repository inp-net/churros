import { builder, prisma } from '#lib';
import { EventType } from '#modules/events';
import { TicketType } from '#modules/ticketing/types';
import {
  canSeeTicket,
  canSeeTicketPrismaIncludes,
  canSeeTicketPrismaIncludesForUser,
} from '#modules/ticketing/utils';

builder.prismaObjectField(EventType, 'ticket', (t) =>
  t.prismaField({
    type: TicketType,
    nullable: true,
    args: {
      slug: t.arg.string({ required: true }),
    },
    async authScopes(event, { slug }, { user }) {
      const ticket = await prisma.ticket.findUnique({
        where: {
          eventId_slug: { slug, eventId: event.id },
        },
        include: canSeeTicketPrismaIncludes,
      });
      if (!ticket) return true;
      const userWithContributesTo = user
        ? await prisma.user.findUnique({
            where: { id: user.id },
            include: canSeeTicketPrismaIncludesForUser,
          })
        : undefined;
      return canSeeTicket(ticket, userWithContributesTo);
    },
    async resolve(query, event, { slug }) {
      return prisma.ticket.findFirst({
        ...query,
        where: {
          slug,
          eventId: event.id,
        },
      });
    },
  }),
);
