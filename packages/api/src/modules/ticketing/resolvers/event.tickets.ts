import { builder } from '#lib';
import { EventType } from '#modules/events';
import { TicketType } from '#modules/ticketing/types';
import {
  getTicketsWithConstraints,
  getUserWithContributesTo,
  userCanSeeTicket,
} from '#permissions';

builder.prismaObjectField(EventType, 'tickets', (t) =>
  t.prismaField({
    type: [TicketType],
    async resolve(query, { id }, _, { user }) {
      const allTickets = await getTicketsWithConstraints(id, query);
      const userWithContributesTo = user ? await getUserWithContributesTo(user.id) : undefined;
      return allTickets.filter((ticket) => userCanSeeTicket(ticket, userWithContributesTo));
    },
  }),
);
