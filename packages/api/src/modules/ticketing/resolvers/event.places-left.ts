import { builder, prisma, subscriptionName, type Context } from '#lib';
import { eventCapacity, EventType } from '#modules/events';
import type { Event, EventManager, Group } from '@churros/db/prisma';
import { canSeeBookings } from './event.can-see-bookings.js';

export function canSeePlacesLeftCount(
  event: Event & { managers: EventManager[]; group: Group },
  user: Context['user'],
  placesLeft: number,
) {
  return placesLeft === 0 || event.showPlacesLeft || canSeeBookings(event, user);
}

builder.prismaObjectField(EventType, 'placesLeft', (t) =>
  t.int({
    nullable: true,
    subscribe: (subs, { id }) => {
      subs.register(subscriptionName(id));
    },
    async resolve(event, _, { user }) {
      const { id } = event;

      const registrations = await prisma.registration.findMany({
        where: { ticket: { event: { id } } },
      });

      const tickets = await prisma.ticket.findMany({
        where: { event: { id } },
        include: {
          group: true,
        },
      });
      const ticketGroups = await prisma.ticketGroup.findMany({
        where: { event: { id } },
        include: {
          tickets: true,
        },
      });

      let placesLeft = Math.max(
        0,
        eventCapacity(tickets, ticketGroups) -
          registrations.filter((r) => !r.cancelledAt && !r.opposedAt).length,
      );

      if (placesLeft === Number.POSITIVE_INFINITY) placesLeft = -1;

      return canSeePlacesLeftCount(event, user, placesLeft) ? placesLeft : null;
    },
  }),
);
