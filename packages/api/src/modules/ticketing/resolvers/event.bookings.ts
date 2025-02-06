import { builder, ensureGlobalId, prisma } from '#lib';
import { EventType } from '#modules/events';
import {
  BookingStateEnum,
  RegistrationType,
  bookingStatePrismaWhereClause,
  canSeeAllBookings,
} from '#modules/ticketing';

builder.prismaObjectField(EventType, 'bookings', (t) =>
  t.prismaConnection({
    type: RegistrationType,
    cursor: 'id',
    args: {
      only: t.arg({
        description: "Ne montre que les réservations d'un certain statut",
        type: BookingStateEnum,
      }),
    },
    async subscribe(subscriptions, { id }) {
      subscriptions.register(id);
    },
    async authScopes(event, _, { user }) {
      return canSeeAllBookings(event, user);
    },
    async resolve(query, { id }, { only }) {
      return prisma.registration.findMany({
        ...query,
        where: {
          AND: [
            { ticket: { eventId: ensureGlobalId(id, 'Event') } },
            bookingStatePrismaWhereClause(only),
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  }),
);
