import { builder, ensureGlobalId, prisma } from '#lib';
import { EventType } from '#modules/events';
import { LocalID } from '#modules/global';
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
      id: t.arg({ type: LocalID }),
    },
    async authScopes(_, args, { user }) {
      const id = ensureGlobalId(args.id, 'Ticket');
      const ticket = await prisma.ticket.findUnique({
        where: {
          id,
        },
        include: canSeeTicketPrismaIncludes,
      });
      if (!ticket) return true;
      const userWithContributesTo = user
        ? await prisma.user.findUnique({
            where: { id: user.id },
            include: canSeeTicketPrismaIncludesForUser,
          })
        : null;
      return canSeeTicket(ticket, userWithContributesTo);
    },
    async resolve(query, _, { id }) {
      return prisma.ticket.findFirst({
        ...query,
        where: {
          id: ensureGlobalId(id, 'Ticket'),
        },
      });
    },
  }),
);
