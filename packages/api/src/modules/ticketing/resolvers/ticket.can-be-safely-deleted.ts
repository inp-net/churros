import { builder, prisma } from '#lib';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events';
import { TicketType } from '#modules/ticketing/types';
import { ticketCanBeSafelyDeleted } from '#modules/ticketing/utils';

builder.prismaObjectField(TicketType, 'canBeSafelyDeleted', (t) =>
  t.boolean({
    description: 'Indique si le billet peut être supprimé avec `deleteTicket(force: false)`',
    async authScopes({ eventId }, _, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id: eventId },
        include: canEditEventPrismaIncludes,
      });
      return canEditEvent(event, user);
    },
    async resolve({ id }) {
      return ticketCanBeSafelyDeleted(id);
    },
  }),
);
