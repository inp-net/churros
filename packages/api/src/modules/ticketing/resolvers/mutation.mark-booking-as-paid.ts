import { builder, ensureGlobalId, prisma, UnauthorizedError } from '#lib';
import { canSeeAllBookings, canSeeAllBookingsPrismaIncludes } from '#modules/ticketing';
import { RegistrationType } from '#modules/ticketing/types';

builder.mutationField('markBookingAsPaid', (t) =>
  t.prismaField({
    type: RegistrationType,
    errors: {},
    description: 'Marquer une réservation comme payée',
    args: {
      code: t.arg.string({
        description: 'Code de la réservation',
      }),
      verify: t.arg.boolean({
        required: false,
        description: 'Aussi marquer la réservation comme vérifiée (scannée)',
      }),
    },
    async authScopes(_, { code }, { user }) {
      const event = await prisma.registration
        .findUniqueOrThrow({
          where: { id: ensureGlobalId(code.toLowerCase(), 'Registration') },
        })
        .ticket()
        .event({
          include: canSeeAllBookingsPrismaIncludes,
        });
      return canSeeAllBookings(event, user);
    },
    async resolve(query, _, args, { user }) {
      if (!user) throw new UnauthorizedError();
      return prisma.registration.update({
        ...query,
        where: { id: ensureGlobalId(args.code.toLowerCase(), 'Registration') },
        data: args.verify
          ? {
              paid: true,
              verifiedAt: new Date(),
              verifiedById: user.id,
            }
          : {
              paid: true,
            },
      });
    },
  }),
);
