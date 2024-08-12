import { builder, ensureGlobalId, log, prisma } from '#lib';
import { RegistrationType } from '#modules/ticketing';

builder.queryField('booking', (t) =>
  t.prismaField({
    type: RegistrationType,
    description: 'Récupère une réservation par son code',
    args: {
      code: t.arg.string(),
    },
    authScopes: () => true,
    async resolve(query, _, { code }, { user }) {
      const booking = await prisma.registration.update({
        ...query,
        where: { id: ensureGlobalId(code.toLowerCase(), 'Registration') },
        data: user
          ? {
              seenBy: {
                connect: { id: user.id },
              },
            }
          : {},
      });
      await log('bookings', 'access', { code }, booking.id, user);
      return booking;
    },
  }),
);
