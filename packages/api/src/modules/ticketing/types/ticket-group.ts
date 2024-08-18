import { builder, prisma } from '#lib';
import {
  canSeeTicket,
  canSeeTicketPrismaIncludes,
  canSeeTicketPrismaIncludesForUser,
  TicketType,
} from '#modules/ticketing';

export const TicketGroupType = builder.prismaNode('TicketGroup', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    eventId: t.exposeID('eventId'),
    event: t.relation('event'),
    capacity: t.exposeInt('capacity'),
    tickets: t.prismaField({
      type: [TicketType],
      async resolve(_query, { id }, _, { user }) {
        const userAdditionalData = user
          ? await prisma.user.findUniqueOrThrow({
              where: { id: user.id },
              include: canSeeTicketPrismaIncludesForUser,
            })
          : null;

        return (
          prisma.ticketGroup
            .findUniqueOrThrow({
              where: { id },
            })
            // TODO waiting on Pothos update so that it supports query include object merging
            // .tickets({ ...query({ include: canSeeTicketPrismaIncludes }) })
            .tickets({ include: canSeeTicketPrismaIncludes })
            .then((tickets) => tickets.filter((ticket) => canSeeTicket(ticket, userAdditionalData)))
        );
      },
    }),
    ticketsCount: t.int({
      resolve: async ({ id }) => {
        const tickets = await prisma.ticketGroup.findUniqueOrThrow({
          where: { id },
          select: {
            _count: {
              select: {
                tickets: true,
              },
            },
          },
        });
        return tickets._count.tickets;
      },
    }),
  }),
});
