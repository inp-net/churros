import { builder, prisma, subscriptionName } from '#lib';
import { TicketType, canSeePlacesLeftCount, placesLeft } from '../index.js';

builder.prismaObjectField(TicketType, 'placesLeft', (t) =>
  t.int({
    nullable: true,
    description:
      "Nombre de places restantes. Null si l'information n'est pas disponible. N'est jamais null quand il n'y a plus de places disponibles (0)",
    subscribe(subs, { id }) {
      subs.register(subscriptionName(id));
    },
    async resolve({ id, eventId }, _, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id: eventId },
        include: { managers: true, group: true },
      });

      const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: placesLeft.prismaIncludes,
      });
      if (!ticket) return 0;

      let places = placesLeft(ticket);
      // TODO handle infinity at the scalar level
      if (places === Number.POSITIVE_INFINITY) places = -1;

      return canSeePlacesLeftCount(event, user, places) ? places : null;
    },
    complexity: 5,
  }),
);
