import { builder, prisma } from '#lib';
import { EventType } from '#modules/events';
import { RegistrationType, canSeeAllBookings } from '#modules/ticketing';

builder.prismaObjectField(EventType, 'bookings', (t) =>
  t.prismaConnection({
    type: RegistrationType,
    cursor: 'id',
    async subscribe(subscriptions, { id }) {
      subscriptions.register(id);
    },
    async authScopes(event, _, { user }) {
      return canSeeAllBookings(event, user);
    },
    async resolve(query, { id }) {
      return prisma.registration.findMany({
        ...query,
        where: { ticket: { eventId: id } },
        orderBy: { createdAt: 'desc' },
      });
    },
  }),
);
