import { builder, ensureGlobalId, graphinx, prisma } from '#lib';
import { EventType } from '#modules/events';
import { RegistrationType, canSeeAllBookings } from '#modules/ticketing';
import type { Prisma } from '@churros/db/prisma';

builder.prismaObjectField(EventType, 'bookings', (t) =>
  t.prismaConnection({
    type: RegistrationType,
    cursor: 'id',
    args: {
      only: t.arg({
        description: "Ne montre que les réservations d'un certain statut",
        type: builder.enumType('BookingState', {
          ...graphinx('ticketing'),
          values: {
            Paid: { value: 'Paid', description: 'Payée' },
            Verified: { value: 'Verified', description: 'Scannée' },
            Unpaid: { value: 'Unpaid', description: 'Non payée et non scannée' },
          },
        }),
      }),
    },
    async subscribe(subscriptions, { id }) {
      subscriptions.register(id);
    },
    async authScopes(event, _, { user }) {
      return canSeeAllBookings(event, user);
    },
    async resolve(query, { id }, { only }) {
      const filter: Prisma.RegistrationFindManyArgs['where'] = {
        Paid: { paid: true, verifiedAt: null },
        Verified: { verifiedAt: { not: null } },
        Unpaid: { paid: false, verifiedAt: null },
      }[only ?? 'Unpaid'];

      return prisma.registration.findMany({
        ...query,
        where: {
          AND: [
            {
              ticket: { eventId: ensureGlobalId(id, 'Event') },
            },
            filter,
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  }),
);
