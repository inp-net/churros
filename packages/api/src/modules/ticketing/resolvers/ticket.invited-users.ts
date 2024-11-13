import { builder, prisma } from '#lib';
import { canSeeAllBookings, canSeeAllBookingsPrismaIncludes } from '#modules/ticketing';
import { TicketType } from '#modules/ticketing/types';
import { UserType } from '#modules/users';

builder.prismaObjectField(TicketType, 'invitedUsers', (t) =>
  t.prismaConnection({
    type: UserType,
    cursor: 'id',
    description: "Personnes ayant utilisé un code d'invitation pour accéder à ce billet",
    async authScopes({ id }, _, { user }) {
      const event = await prisma.ticket
        .findUniqueOrThrow({ where: { id } })
        .event({ include: canSeeAllBookingsPrismaIncludes });
      return canSeeAllBookings(event, user);
    },
    async resolve(query, { id }) {
      return prisma.ticket.findUniqueOrThrow({ where: { id } }).invited(query);
    },
  }),
);
