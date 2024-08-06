import { builder, ensureGlobalId, prisma, publish } from '#lib';
import { RegistrationType } from '#modules/ticketing/types';
import { ZodError } from 'zod';

builder.mutationField('cancelBooking', (t) =>
  t.prismaField({
    type: RegistrationType,
    errors: { types: [Error, ZodError] },
    args: {
      code: t.arg.string({ description: 'Code de réservation' }),
    },
    authScopes: () => true,
    async resolve(query, _, { code }, { user }) {
      const result = await prisma.registration.update({
        select: { id: true, ticket: { select: { eventId: true } } },
        where: { id: ensureGlobalId(code.toLowerCase(), 'Registration') },
        data: {
          cancelledAt: new Date(),
          cancelledBy: { connect: { id: user?.id } },
        },
      });
      publish(result.ticket.eventId, 'deleted', result.id);
      return prisma.registration.findUniqueOrThrow({
        ...query,
        where: { id: result.id },
      });
    },
  }),
);
