import { builder, prisma } from '#lib';
import { EventType } from '#modules/events';
import { preprocessBeneficiary, RegistrationType } from '#modules/ticketing';

builder.prismaObjectField(EventType, 'myBookings', (t) =>
  t.prismaField({
    type: [RegistrationType],
    description: "Réservations faites par et/ou pour l'utilisateur.ice connecté.e",
    async resolve(query, { id }, _, { user }) {
      if (!user) return [];
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
