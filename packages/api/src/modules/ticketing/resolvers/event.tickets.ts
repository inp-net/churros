import { builder } from '#lib';
import { EventType } from '#modules/events';
import { TicketType } from '#modules/ticketing/types';
import {
  canSeeTicket,
  getTicketsWithConstraints,
  ticketsByShotgunSorter,
} from '#modules/ticketing/utils';
import { getUserWithContributesTo } from '#permissions';

builder.prismaObjectField(EventType, 'tickets', (t) =>
  t.prismaField({
    type: [TicketType],
    async resolve(query, { id }, _, { user }) {
      const allTickets = await getTicketsWithConstraints(id, query);
      const userWithContributesTo = user ? await getUserWithContributesTo(user.id) : null;
      return allTickets
        .filter((ticket) => canSeeTicket(ticket, userWithContributesTo))
        .toSorted(ticketsByShotgunSorter);
    },
  }),
);
