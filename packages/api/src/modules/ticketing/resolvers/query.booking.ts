import { builder, ensureGlobalId, log, prisma } from '#lib';
import { RegistrationType } from '#modules/ticketing';

builder.queryField('booking', (t) =>
  t.prismaField({
    type: RegistrationType,
    nullable: true,
    description: 'Récupère une réservation par son code',
    args: {
      code: t.arg.string(),
    },
    authScopes: () => true,
    async resolve(query, _, { code }, { user }) {
      const booking = await prisma.registration.findUnique({
        ...query,
        where: { id: ensureGlobalId(code.toLowerCase(), 'Registration') },
      });
      if (booking) await log('bookings', 'access', { code }, booking.id, user);
      return booking;
    },
  }),
);
