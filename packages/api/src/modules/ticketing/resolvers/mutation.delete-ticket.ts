import { builder, prisma } from '#lib';
import { userCanManageEvent } from '#permissions';
import { GraphQLError } from 'graphql';

builder.mutationField('deleteTicket', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
      force: t.arg.boolean({
        defaultValue: false,
        description: "Supprimer le billet même s'il existe des réservations",
      }),
    },
    async authScopes(_, { id }, { user }) {
      const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
          event: {
            include: {
              managers: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });
      if (!ticket) return false;
      return userCanManageEvent(ticket.event, user, { canEdit: true });
    },
    async resolve(_, { id, force }) {
      const bookingsCount = await prisma.registration.count({
        where: { ticketId: id },
      });

      // TODO softdelete
      if (!force && bookingsCount > 0)
        throw new GraphQLError('Impossible de supprimer un billet avec des réservations');

      await prisma.ticket.delete({
        where: { id },
      });
      return true;
    },
  }),
);
