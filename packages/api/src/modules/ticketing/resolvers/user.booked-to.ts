import { builder, ensureGlobalId, prisma } from '#lib';
import { LocalID } from '#modules/global';
import { canSeeAllBookings, canSeeAllBookingsPrismaIncludes } from '#modules/ticketing';
import { UserType } from '#modules/users';

builder.prismaObjectField(UserType, 'bookedTo', (t) =>
  t.boolean({
    description: "L'utilisateur·ice a réservé un billet pour un évènement donné",
    args: {
      event: t.arg({ type: LocalID }),
      using: t.arg({
        required: false,
        type: LocalID,
        description: 'En utilisant ce billet spécifiquement',
      }),
    },
    async authScopes(_, { event: eventId }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id: ensureGlobalId(eventId, 'Event') },
        include: canSeeAllBookingsPrismaIncludes,
      });

      return canSeeAllBookings(event, user);
    },
    async resolve({ id: userId }, { event: eventId, using: ticketId }) {
      return prisma.registration
        .findFirst({
          where: {
            ticket: {
              eventId: ensureGlobalId(eventId, 'Event'),
              id: ticketId ? ensureGlobalId(ticketId, 'Ticket') : undefined,
              registrations: {
                some: {
                  OR: [{ authorId: userId }, { internalBeneficiaryId: userId }],
                },
              },
            },
          },
        })
        .then(Boolean);
    },
  }),
);
