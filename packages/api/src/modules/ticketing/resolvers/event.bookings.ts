import { builder, prisma } from '#lib';
import { RegistrationType, canSeeBookings } from '#modules/ticketing';
import { EventType } from '#modules/events';

builder.prismaObjectField(EventType, 'bookings', (t) =>
  t.prismaConnection({
    type: RegistrationType,
    cursor: 'id',
    async subscribe(subscriptions, { id }) {
      subscriptions.register(id);
    },
    async authScopes({ id }, _, { user }) {
      const event = await prisma.event.findFirst({
        where: { id },
        include: { managers: true, group: true },
      });
      if (!event) return false;
      return canSeeBookings(event, user);
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
