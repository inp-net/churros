import { builder, prisma, soonest } from '#lib';
import { EventType } from '#modules/events';
import { DateTimeScalar } from '#modules/global';
import {
  canSeeTicket,
  canSeeTicketPrismaIncludes,
  canSeeTicketPrismaIncludesForUser,
} from '#modules/ticketing/utils';

builder.prismaObjectField(EventType, 'mySoonestShotgunOpensAt', (t) =>
  t.field({
    type: DateTimeScalar,
    deprecationReason:
      "Use first ticket's opensAt instead. Event.tickets is now sorted such that if the user has access to tickets with soon-to-open or opened shotguns, the earliest one will be first.",
    nullable: true,
    async resolve({ id }, _, { user }) {
      if (!user) return;
      const tickets = await prisma.ticket.findMany({
        where: { event: { id } },
        include: canSeeTicketPrismaIncludes,
      });

      const userWithContributions = await prisma.user.findUniqueOrThrow({
        where: { id: user?.id },
        include: canSeeTicketPrismaIncludesForUser,
      });

      const accessibleTickets = tickets.filter((t) => canSeeTicket(t, userWithContributions));
      return soonest(...accessibleTickets.map((t) => t.opensAt));
    },
  }),
);
