import { builder, prisma, UnauthorizedError } from '#lib';
import { EventType } from '#modules/events';
import { preprocessBeneficiary, RegistrationType } from '#modules/ticketing';

builder.prismaObjectField(EventType, 'myBookings', (t) =>
  t.prismaField({
    type: [RegistrationType],
    description: "Réservations faites par et/ou pour l'utilisateur.ice connecté.e",
    errors: {},
    authScopes: { loggedIn: true },
    async resolve(query, { id }, _, { user }) {
      if (!user) throw new UnauthorizedError();
      return prisma.registration.findMany({
        ...query,
        where: {
          ticket: {
            eventId: id,
          },
          OR: [
            { authorId: user.id },
            { beneficiary: preprocessBeneficiary(user.uid) },
            { authorEmail: user.email },
          ],
        },
      });
    },
  }),
);
