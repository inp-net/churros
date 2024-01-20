import { builder, prisma } from '#lib';

import { eventManagedByUser } from '#permissions';

builder.mutationField('deleteTicket', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
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
      return eventManagedByUser(ticket.event, user, { canEdit: true });
    },
    async resolve(_, { id }) {
      await prisma.ticket.delete({ where: { id } });
      return true;
    },
  }),
);
