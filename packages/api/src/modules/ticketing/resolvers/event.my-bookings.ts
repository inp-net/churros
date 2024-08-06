import { builder, prisma } from '#lib';
import { EventType } from '#modules/events';
import { preprocessBeneficiary, RegistrationType } from '#modules/ticketing';

builder.prismaObjectField(EventType, 'myBookings', (t) =>
  t.prismaField({
    type: [RegistrationType],
    description:
      "Réservations faites par et/ou pour l'utilisateur.ice connecté.e. Triée par bénéficiaire (soi-même d'abord), puis par date de création. Renvoie au maximum 100 réservations.",
    args: {
      count: t.arg.int({ required: false, description: 'Nombre de réservations à récupérer' }),
    },
    async resolve(query, { id }, { count }, { user }) {
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
        // TODO see https://git.inpt.fr/inp-net/churros/-/issues/1015
        orderBy: [{ beneficiary: 'desc' }, { createdAt: 'asc' }],
        take: count ?? 100,
      });
    },
  }),
);
